package com.nexo.import.dto;

import java.util.List;

public record ImportSummaryResponse(
    int totalRecords,
    int success,
    int failed,
    List<ImportErrorDTO> errors
) {}
