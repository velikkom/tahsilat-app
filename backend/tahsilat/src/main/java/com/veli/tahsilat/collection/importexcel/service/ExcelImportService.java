package com.veli.tahsilat.collection.importexcel.service;

import com.veli.tahsilat.collection.importexcel.dto.response.CollectionImportResultResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ExcelImportService {

    CollectionImportResultResponse dryRun(MultipartFile file);

    CollectionImportResultResponse importCollections(MultipartFile file);
}
