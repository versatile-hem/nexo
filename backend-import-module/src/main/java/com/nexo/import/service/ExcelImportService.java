package com.nexo.import.service;

import com.nexo.import.dto.ImportErrorDTO;
import com.nexo.import.dto.ImportRowDTO;
import com.nexo.import.dto.ImportSummaryResponse;
import com.nexo.import.util.ExcelParser;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ExcelImportService {

  private static final int CHUNK_SIZE = 50;
  private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

  private final ExcelParser excelParser;
  private final SalesImportGateway salesImportGateway;
  private final Optional<InvoiceGateway> invoiceGateway;
  private final boolean autoCreateInvoice;
  private final String companyState;

  public ExcelImportService(
      ExcelParser excelParser,
      SalesImportGateway salesImportGateway,
      Optional<InvoiceGateway> invoiceGateway,
      @Value("${nexo.import.auto-create-invoice:true}") boolean autoCreateInvoice,
      @Value("${nexo.company.state:Haryana}") String companyState
  ) {
    this.excelParser = excelParser;
    this.salesImportGateway = salesImportGateway;
    this.invoiceGateway = invoiceGateway;
    this.autoCreateInvoice = autoCreateInvoice;
    this.companyState = companyState;
  }

  public ImportSummaryResponse importSalesOrders(MultipartFile file) {
    List<ImportRowDTO> parsedRows;
    try {
      parsedRows = excelParser.parseSalesImport(file);
    } catch (IOException e) {
      return new ImportSummaryResponse(0, 0, 1, List.of(new ImportErrorDTO(0, "Unable to parse Excel: " + e.getMessage())));
    }

    int totalRecords = parsedRows.size();
    int success = 0;
    List<ImportErrorDTO> errors = new ArrayList<>();

    Map<String, Long> orderCache = new ConcurrentHashMap<>();

    for (int start = 0; start < parsedRows.size(); start += CHUNK_SIZE) {
      int end = Math.min(start + CHUNK_SIZE, parsedRows.size());
      List<ImportRowDTO> chunk = parsedRows.subList(start, end);

      ChunkResult chunkResult = salesImportGateway.runInTransaction(() -> processChunk(chunk, orderCache));
      success += chunkResult.success();
      errors.addAll(chunkResult.errors());
    }

    return new ImportSummaryResponse(totalRecords, success, errors.size(), errors);
  }

  private ChunkResult processChunk(List<ImportRowDTO> rows, Map<String, Long> orderCache) {
    int success = 0;
    List<ImportErrorDTO> errors = new ArrayList<>();

    for (ImportRowDTO row : rows) {
      try {
        validateRow(row);

        CustomerRef customer = salesImportGateway.findOrCreateCustomerByName(row.customerName().trim());
        ProductRef product = salesImportGateway
            .findProductBySkuOrName(safeTrim(row.sku()), safeTrim(row.productName()))
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        BigDecimal quantity = row.quantity().setScale(3, RoundingMode.HALF_UP);
        BigDecimal totalPriceInclusive = row.totalPrice().setScale(2, RoundingMode.HALF_UP);
        GstBreakdown breakdown = calculateGstInclusiveBreakdown(totalPriceInclusive, product.gstRate(), isIntraState(customer.state()));

        String orderKey = orderGroupingKey(customer.id(), row.orderDate(), row.channel());
        Long orderId = orderCache.computeIfAbsent(orderKey, key ->
            salesImportGateway.findOrCreateSalesOrder(
                customer.id(),
                customer.name(),
                row.orderDate(),
                normalizeChannel(row.channel())
            )
        );

        BigDecimal baseUnitPrice = breakdown.baseAmount().divide(quantity, 4, RoundingMode.HALF_UP);

        salesImportGateway.createSalesOrderItem(new SalesOrderItemCreateCommand(
            orderId,
            product.id(),
            product.sku(),
            quantity,
            baseUnitPrice,
            breakdown.baseAmount(),
            breakdown.gstAmount(),
            breakdown.cgst(),
            breakdown.sgst(),
            breakdown.igst(),
            totalPriceInclusive
        ));

        salesImportGateway.decreaseStock(product.id(), quantity);

        if (autoCreateInvoice && invoiceGateway.isPresent()) {
          invoiceGateway.get().createOrUpdateInvoice(orderId);
        }

        success++;
      } catch (Exception ex) {
        errors.add(new ImportErrorDTO(row.rowNumber(), sanitizeError(ex.getMessage())));
      }
    }

    return new ChunkResult(success, errors);
  }

  private void validateRow(ImportRowDTO row) {
    if (safeTrim(row.customerName()).isBlank()) {
      throw new IllegalArgumentException("Customer name is required");
    }

    if (safeTrim(row.sku()).isBlank() && safeTrim(row.productName()).isBlank()) {
      throw new IllegalArgumentException("Either SKU or Product Name is required");
    }

    if (row.quantity() == null || row.quantity().compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("Quantity must be greater than 0");
    }

    if (row.totalPrice() == null || row.totalPrice().compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("Total price must be greater than 0");
    }

    if (row.orderDate() == null) {
      throw new IllegalArgumentException("Order date is required");
    }
  }

  private GstBreakdown calculateGstInclusiveBreakdown(BigDecimal totalInclusive, BigDecimal gstRate, boolean intraState) {
    BigDecimal divisor = BigDecimal.ONE.add(gstRate.divide(HUNDRED, 8, RoundingMode.HALF_UP));
    BigDecimal baseAmount = totalInclusive.divide(divisor, 2, RoundingMode.HALF_UP);
    BigDecimal gstAmount = totalInclusive.subtract(baseAmount).setScale(2, RoundingMode.HALF_UP);

    if (intraState) {
      BigDecimal half = gstAmount.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
      return new GstBreakdown(baseAmount, gstAmount, half, half, BigDecimal.ZERO);
    }

    return new GstBreakdown(baseAmount, gstAmount, BigDecimal.ZERO, BigDecimal.ZERO, gstAmount);
  }

  private String orderGroupingKey(Long customerId, LocalDate orderDate, String channel) {
    return customerId + "|" + orderDate + "|" + normalizeChannel(channel);
  }

  private String normalizeChannel(String value) {
    String normalized = safeTrim(value);
    return normalized.isBlank() ? "OFFLINE" : normalized.toUpperCase(Locale.ROOT);
  }

  private boolean isIntraState(String customerState) {
    return safeTrim(customerState).equalsIgnoreCase(safeTrim(companyState));
  }

  private String safeTrim(String value) {
    return value == null ? "" : value.trim();
  }

  private String sanitizeError(String value) {
    if (value == null || value.isBlank()) {
      return "Unknown import error";
    }
    return value;
  }

  public interface SalesImportGateway {
    ChunkResult runInTransaction(TransactionalChunk chunk);

    CustomerRef findOrCreateCustomerByName(String customerName);

    Optional<ProductRef> findProductBySkuOrName(String sku, String productName);

    Long findOrCreateSalesOrder(Long customerId, String customerName, LocalDate orderDate, String channel);

    void createSalesOrderItem(SalesOrderItemCreateCommand command);

    void decreaseStock(Long productId, BigDecimal quantity);
  }

  @FunctionalInterface
  public interface TransactionalChunk {
    ChunkResult execute();
  }

  public interface InvoiceGateway {
    void createOrUpdateInvoice(Long salesOrderId);
  }

  public record CustomerRef(Long id, String name, String state) {}

  public record ProductRef(Long id, String sku, String name, BigDecimal gstRate) {}

  public record SalesOrderItemCreateCommand(
      Long salesOrderId,
      Long productId,
      String sku,
      BigDecimal quantity,
      BigDecimal unitBasePrice,
      BigDecimal baseAmount,
      BigDecimal gstAmount,
      BigDecimal cgstAmount,
      BigDecimal sgstAmount,
      BigDecimal igstAmount,
      BigDecimal totalAmount
  ) {}

  public record GstBreakdown(
      BigDecimal baseAmount,
      BigDecimal gstAmount,
      BigDecimal cgst,
      BigDecimal sgst,
      BigDecimal igst
  ) {}

  public record ChunkResult(int success, List<ImportErrorDTO> errors) {
    public static ChunkResult empty() {
      return new ChunkResult(0, new ArrayList<>());
    }
  }
}
