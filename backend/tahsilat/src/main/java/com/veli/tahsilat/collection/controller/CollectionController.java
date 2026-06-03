package com.veli.tahsilat.collection.controller;

import com.veli.tahsilat.collection.dto.request.CreateCollectionRequest;
import com.veli.tahsilat.collection.dto.request.UpdateCollectionRequest;
import com.veli.tahsilat.collection.dto.response.CollectionResponse;
import com.veli.tahsilat.collection.service.CollectionService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    @Operation(
            summary = "Create collection"
    )
    @PostMapping
    @PreAuthorize(
            "hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')"
    )
    public ResponseEntity<CollectionResponse> createCollection(@Valid @RequestBody CreateCollectionRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(
                collectionService.createCollection(request));
    }

    @Operation(
            summary = "Get all collections"
    )
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<Page<CollectionResponse>> getAllCollections(Pageable pageable) {

        return ResponseEntity.ok(collectionService.getAllCollections(pageable));
    }

    @Operation(
            summary = "Get collections by customer id"
    )
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<Page<CollectionResponse>> getCollectionsByCustomerId(@PathVariable UUID customerId, Pageable pageable) {

        return ResponseEntity.ok(collectionService.getCollectionsByCustomerId(customerId, pageable));
    }

    @Operation(
            summary = "Get overdue collections"
    )
    @GetMapping("/overdue")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<Page<CollectionResponse>> getOverdueCollections(Pageable pageable) {
        return ResponseEntity.ok(collectionService.getOverdueCollections(pageable));
    }

    @Operation(
            summary = "Get collection by id"
    )
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<CollectionResponse> getCollectionById(@PathVariable UUID id) {

        return ResponseEntity.ok(collectionService.getCollectionById(id));
    }

    @Operation(
            summary = "Update collection by id"
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<CollectionResponse> updateCollection(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCollectionRequest request
    ) {

        return ResponseEntity.ok(collectionService.updateCollection(id, request));
    }

    @Operation(
            summary = "Delete collection by id"
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<Void> deleteCollection(@PathVariable UUID id) {

        collectionService.deleteCollection(id);

        return ResponseEntity.noContent().build();
    }
}
