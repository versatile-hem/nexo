package com.nexo.import.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ImportRowDTO(
    int rowNumber,
    String customerName,
    String productName,
    String sku,
    BigDecimal quantity,
    BigDecimal totalPrice,
    LocalDate orderDate,
    String channel
) {}
