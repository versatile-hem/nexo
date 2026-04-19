package com.nexo.import.util;

import com.nexo.import.dto.ImportRowDTO;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class ExcelParser {

  private static final DateTimeFormatter[] SUPPORTED_DATE_FORMATS = new DateTimeFormatter[] {
      DateTimeFormatter.ofPattern("yyyy-MM-dd"),
      DateTimeFormatter.ofPattern("dd-MM-yyyy"),
      DateTimeFormatter.ofPattern("dd/MM/yyyy"),
      DateTimeFormatter.ofPattern("MM/dd/yyyy"),
      DateTimeFormatter.ISO_LOCAL_DATE
  };

  public List<ImportRowDTO> parseSalesImport(MultipartFile file) throws IOException {
    List<ImportRowDTO> rows = new ArrayList<>();

    try (InputStream inputStream = file.getInputStream(); Workbook workbook = new XSSFWorkbook(inputStream)) {
      Sheet sheet = workbook.getSheetAt(0);
      if (sheet == null) {
        return rows;
      }

      Row headerRow = sheet.getRow(0);
      if (headerRow == null) {
        return rows;
      }

      Map<String, Integer> headerMap = buildHeaderMap(headerRow);

      for (int i = 1; i <= sheet.getLastRowNum(); i++) {
        Row row = sheet.getRow(i);
        if (row == null || isRowEmpty(row)) {
          continue;
        }

        String customerName = stringValue(cell(row, headerMap, "customer name"));
        String productName = stringValue(cell(row, headerMap, "product name"));
        String sku = stringValue(cell(row, headerMap, "sku"));
        BigDecimal quantity = decimalValue(cell(row, headerMap, "quantity"));
        BigDecimal totalPrice = decimalValue(cell(row, headerMap, "total price"));
        LocalDate orderDate = dateValue(cell(row, headerMap, "order date"));
        String channel = stringValue(cell(row, headerMap, "channel"));

        rows.add(new ImportRowDTO(
            i + 1,
            customerName,
            productName,
            sku,
            quantity,
            totalPrice,
            orderDate,
            channel
        ));
      }
    }

    return rows;
  }

  private Map<String, Integer> buildHeaderMap(Row headerRow) {
    Map<String, Integer> map = new HashMap<>();
    for (Cell cell : headerRow) {
      String key = stringValue(cell).toLowerCase(Locale.ROOT).trim();
      if (!key.isEmpty()) {
        map.put(key, cell.getColumnIndex());
      }
    }
    return map;
  }

  private Cell cell(Row row, Map<String, Integer> headerMap, String header) {
    Integer index = headerMap.get(header);
    if (index == null) {
      return null;
    }
    return row.getCell(index);
  }

  private String stringValue(Cell cell) {
    if (cell == null) {
      return "";
    }

    if (cell.getCellType() == CellType.STRING) {
      return cell.getStringCellValue().trim();
    }

    if (cell.getCellType() == CellType.NUMERIC) {
      double value = cell.getNumericCellValue();
      long longValue = (long) value;
      if (value == longValue) {
        return String.valueOf(longValue);
      }
      return String.valueOf(value);
    }

    if (cell.getCellType() == CellType.BOOLEAN) {
      return String.valueOf(cell.getBooleanCellValue());
    }

    return "";
  }

  private BigDecimal decimalValue(Cell cell) {
    if (cell == null) {
      return BigDecimal.ZERO;
    }

    if (cell.getCellType() == CellType.NUMERIC) {
      return BigDecimal.valueOf(cell.getNumericCellValue());
    }

    String raw = stringValue(cell);
    if (raw.isBlank()) {
      return BigDecimal.ZERO;
    }

    String normalized = raw.replace(",", "").trim();
    return new BigDecimal(normalized);
  }

  private LocalDate dateValue(Cell cell) {
    if (cell == null) {
      return null;
    }

    if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
      return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }

    String raw = stringValue(cell);
    if (raw.isBlank()) {
      return null;
    }

    for (DateTimeFormatter formatter : SUPPORTED_DATE_FORMATS) {
      try {
        return LocalDate.parse(raw, formatter);
      } catch (DateTimeParseException ignored) {
        // Continue trying supported date formats.
      }
    }

    return null;
  }

  private boolean isRowEmpty(Row row) {
    for (int i = row.getFirstCellNum(); i < row.getLastCellNum(); i++) {
      if (i < 0) {
        continue;
      }
      Cell cell = row.getCell(i);
      if (cell != null && cell.getCellType() != CellType.BLANK && !stringValue(cell).isBlank()) {
        return false;
      }
    }
    return true;
  }
}
