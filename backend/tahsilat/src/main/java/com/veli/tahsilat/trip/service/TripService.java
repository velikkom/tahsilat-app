package com.veli.tahsilat.trip.service;

import com.veli.tahsilat.trip.dto.request.TripRequest;
import com.veli.tahsilat.trip.dto.response.TripResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TripService {

    TripResponse createTrip(TripRequest request);

    TripResponse getTripById(UUID id);

    TripResponse updateTrip(UUID id, TripRequest request);

    void deleteTrip(UUID id);

    Page<TripResponse> getAllTrips(Pageable pageable);

    byte[] generateExpenseDocument(UUID id);

    byte[] generateCollectionDocument(UUID id);
}
