package com.veli.tahsilat.trip.service;

import com.veli.tahsilat.trip.dto.request.TripRequest;
import com.veli.tahsilat.trip.dto.response.TripPrintPreviewResponse;
import com.veli.tahsilat.trip.dto.response.TripResponse;
import com.veli.tahsilat.user.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface TripService {

    TripResponse createTrip(TripRequest request);

    /**
     * Same validation/creation path as createTrip(), but for a salesman
     * other than the current user - used by the Excel import flow, where
     * an admin may upload a trip on behalf of the salesman named in the
     * source file.
     */
    TripResponse createTripForSalesman(TripRequest request, User salesman);

    TripResponse getTripById(UUID id);

    TripResponse updateTrip(UUID id, TripRequest request);

    void deleteTrip(UUID id);

    Page<TripResponse> getAllTrips(Pageable pageable, LocalDate fromDate, LocalDate toDate);

    byte[] generateExpenseDocument(UUID id);

    byte[] generateCollectionDocument(UUID id);

    byte[] generateTahsilatDokumu(UUID id);

    TripPrintPreviewResponse getPrintPreview(UUID id);
}
