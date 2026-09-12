package com.veli.tahsilat.trip.service.impl;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.common.exception.ResourceNotFoundException;
import com.veli.tahsilat.trip.dto.request.TripDailyExpenseRequest;
import com.veli.tahsilat.trip.dto.request.TripRequest;
import com.veli.tahsilat.trip.dto.response.TripResponse;
import com.veli.tahsilat.trip.entity.Trip;
import com.veli.tahsilat.trip.entity.TripDailyExpense;
import com.veli.tahsilat.trip.export.TripCollectionDocumentGenerator;
import com.veli.tahsilat.trip.export.TripExpenseDocumentGenerator;
import com.veli.tahsilat.trip.mapper.TripMapper;
import com.veli.tahsilat.trip.repository.TripRepository;
import com.veli.tahsilat.trip.service.TripService;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private static final long MAX_TRIP_SPAN_DAYS = 14;

    private final TripRepository tripRepository;

    private final UserRepository userRepository;

    private final CollectionRepository collectionRepository;

    private final TripMapper tripMapper;

    private final TripExpenseDocumentGenerator tripExpenseDocumentGenerator;

    private final TripCollectionDocumentGenerator tripCollectionDocumentGenerator;

    @Override
    @Transactional
    public TripResponse createTrip(TripRequest request) {
        validateDateRange(request.getStartDate(), request.getEndDate());
        validateDailyExpenses(request);

        Trip trip = new Trip();
        trip.setSalesman(getCurrentUser());

        applyTripFields(trip, request);
        applyDailyExpenses(trip, request);

        return tripMapper.toResponse(tripRepository.save(trip));
    }

    @Override
    @Transactional(readOnly = true)
    public TripResponse getTripById(UUID id) {
        return tripMapper.toResponse(findAccessibleTrip(id));
    }

    @Override
    @Transactional
    public TripResponse updateTrip(UUID id, TripRequest request) {
        Trip trip = findAccessibleTrip(id);

        validateDateRange(request.getStartDate(), request.getEndDate());
        validateDailyExpenses(request);

        applyTripFields(trip, request);

        trip.getDailyExpenses().clear();
        applyDailyExpenses(trip, request);

        return tripMapper.toResponse(tripRepository.save(trip));
    }

    @Override
    @Transactional
    public void deleteTrip(UUID id) {
        Trip trip = findAccessibleTrip(id);
        trip.setActive(false);
        tripRepository.save(trip);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TripResponse> getAllTrips(Pageable pageable, LocalDate fromDate, LocalDate toDate) {
        validateDateFilterRange(fromDate, toDate);

        Pageable sortedPageable = applyDefaultSort(pageable);

        if (isAdmin()) {
            return tripRepository
                    .findByActiveTrueAndDateRangeOverlap(fromDate, toDate, sortedPageable)
                    .map(tripMapper::toResponse);
        }

        return tripRepository
                .findBySalesmanIdAndActiveTrueAndDateRangeOverlap(
                        getCurrentUser().getId(), fromDate, toDate, sortedPageable
                )
                .map(tripMapper::toResponse);
    }

    private Pageable applyDefaultSort(Pageable pageable) {
        if (pageable.getSort().isSorted()) {
            return pageable;
        }

        Sort defaultSort = Sort.by(
                Sort.Order.desc("startDate"),
                Sort.Order.desc("createdAt")
        );

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), defaultSort);
    }

    private void validateDateFilterRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && toDate.isBefore(fromDate)) {
            throw new BusinessException("Bitiş tarihi başlangıç tarihinden önce olamaz.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateExpenseDocument(UUID id) {
        Trip trip = findAccessibleTrip(id);

        Map<PaymentType, BigDecimal> collectionSumsByType =
                new EnumMap<>(PaymentType.class);

        for (Object[] row : collectionRepository.sumAmountGroupByPaymentTypeForCollectedByAndDateRange(
                trip.getSalesman().getId(),
                trip.getStartDate(),
                trip.getEndDate()
        )) {
            collectionSumsByType.put((PaymentType) row[0], (BigDecimal) row[1]);
        }

        return tripExpenseDocumentGenerator.generate(trip, collectionSumsByType);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateCollectionDocument(UUID id) {
        Trip trip = findAccessibleTrip(id);

        List<Collection> collections =
                collectionRepository.findByCollectedByIdAndCollectionDateBetweenAndActiveTrueOrderByCollectionDateAsc(
                        trip.getSalesman().getId(),
                        trip.getStartDate(),
                        trip.getEndDate()
                );

        return tripCollectionDocumentGenerator.generate(trip, collections);
    }

    private Trip findAccessibleTrip(UUID id) {
        Trip trip = tripRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        assertCanAccessTrip(trip);

        return trip;
    }

    private void assertCanAccessTrip(Trip trip) {
        if (isAdmin()) {
            return;
        }

        User currentUser = getCurrentUser();
        User salesman = trip.getSalesman();

        if (salesman == null || !currentUser.getId().equals(salesman.getId())) {
            throw new ResourceNotFoundException("Trip not found");
        }
    }

    private void applyTripFields(Trip trip, TripRequest request) {
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setVehiclePlate(request.getVehiclePlate());
        trip.setDenizliExitKm(request.getDenizliExitKm());
        trip.setDenizliEntryKm(request.getDenizliEntryKm());
        trip.setExitFuelAmount(request.getExitFuelAmount());
        trip.setTripFuelAmount(request.getTripFuelAmount());
        trip.setWeeklyAllowance(request.getWeeklyAllowance());
        trip.setCommissionReceived(request.getCommissionReceived());
        trip.setExtraReceived(request.getExtraReceived());
        trip.setAgiReceived(request.getAgiReceived());
        trip.setReceiverName(request.getReceiverName());
    }

    private void applyDailyExpenses(Trip trip, TripRequest request) {
        for (TripDailyExpenseRequest expenseRequest : request.getDailyExpenses()) {
            TripDailyExpense expense = new TripDailyExpense();
            expense.setTrip(trip);
            expense.setExpenseDate(expenseRequest.getExpenseDate());
            expense.setMealAmount(expenseRequest.getMealAmount());
            expense.setHotelAmount(expenseRequest.getHotelAmount());
            expense.setFuelInvoiceAmount(expenseRequest.getFuelInvoiceAmount());
            expense.setOtherAmount(expenseRequest.getOtherAmount());
            expense.setEveningHotelKm(expenseRequest.getEveningHotelKm());

            trip.getDailyExpenses().add(expense);
        }
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new BusinessException("Bitiş tarihi başlangıç tarihinden önce olamaz.");
        }

        long spanDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        if (spanDays > MAX_TRIP_SPAN_DAYS) {
            throw new BusinessException(
                    "Tur süresi en fazla " + MAX_TRIP_SPAN_DAYS + " gün olabilir."
            );
        }
    }

    private void validateDailyExpenses(TripRequest request) {
        Set<LocalDate> seenDates = new HashSet<>();

        for (TripDailyExpenseRequest expense : request.getDailyExpenses()) {
            LocalDate expenseDate = expense.getExpenseDate();

            if (expenseDate.isBefore(request.getStartDate())
                    || expenseDate.isAfter(request.getEndDate())) {
                throw new BusinessException(
                        "Harcama tarihi tur tarih aralığı dışında: " + expenseDate
                );
            }

            if (!seenDates.add(expenseDate)) {
                throw new BusinessException(
                        "Aynı tarih için birden fazla harcama satırı girilemez: " + expenseDate
                );
            }
        }
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Trip not found");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
    }

    private boolean isAdmin() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
