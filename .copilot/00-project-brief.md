# Project Brief — BüroTime Production Planning DSS (KDS)

## Project Name (TR)
BüroTime 6 Aylık Satış Tahminine Dayalı Üretim Planlama Karar Destek Sistemi

## Goal
Build a web-based Decision Support System for a furniture office business that:
- uses historical monthly sales and campaign indicator (0/1),
- generates a 6-month sales forecast,
- suggests production quantities,
- visualizes results in a manager-friendly dashboard.

## Users
- Satış Planlama Müdürü (Manager): views dashboard and makes decisions.

## Core Problem
Managers need an easy way to:
- see sales trends,
- understand campaign impact,
- forecast next 6 months,
- decide how much to produce (and optionally stock decisions).

## Tech Stack
Frontend: HTML + CSS + Bootstrap  
Backend: Node.js (Express)  
Database: MySQL

## Language Requirement
- UI labels, table names, and column names MUST be Turkish.
- Code (variables, functions) can be English.

## Inputs (Mandatory)
1) Geçmiş Satış Verisi: (Ay, Satış Adedi)
2) Kampanya Bilgisi: (0/1)

## System-Generated
- Aylık Ortalama Satış
- Mevsimsellik Katsayısı (month/season factor)
- 6 Aylık Satış Tahmini
- Önerilen Üretim Miktarı

## Forecasting Approach (Simple & Explainable)
Use a simple approach the team can explain:
- moving average or trend-based forecast
- apply seasonality factor (optional but preferred)
- adjust using campaign indicator (optional simple multiplier)

## Deliverables
- MySQL schema + seed data
- Node.js API to read sales data and compute forecast
- Bootstrap dashboard with charts & tables
