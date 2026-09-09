package com.veli.tahsilat.trip.entity;

import com.veli.tahsilat.common.entity.BaseEntity;
import com.veli.tahsilat.user.entity.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "trips")
public class Trip
        extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "salesman_id",
            nullable = false
    )
    private User salesman;

    private LocalDate startDate;

    private LocalDate endDate;

    private String vehiclePlate;

    private Integer denizliExitKm;

    private Integer denizliEntryKm;

    private BigDecimal exitFuelAmount;

    private BigDecimal tripFuelAmount;

    private BigDecimal weeklyAllowance;

    private BigDecimal commissionReceived;

    private BigDecimal extraReceived;

    private BigDecimal agiReceived;

    private String receiverName;

    @OneToMany(
            mappedBy = "trip",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("expenseDate ASC")
    private List<TripDailyExpense> dailyExpenses = new ArrayList<>();
}
