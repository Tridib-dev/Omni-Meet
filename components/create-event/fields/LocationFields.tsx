'use client';

import React, { useMemo, useState } from "react";
import { Country, State, City } from "country-state-city";

export interface LocationValue {
    country: string;
    countryCode: string;
    state: string;
    stateCode: string;
    city: string;
}

interface LocationFieldsProps {
    onChange: (value: LocationValue) => void;
}

const LocationFields = ({ onChange }: LocationFieldsProps) => {
    const [countryCode, setCountryCode] = useState("");
    const [stateCode, setStateCode] = useState("");
    const [city, setCity] = useState("");
    const [manualCity, setManualCity] = useState("");

    const countries = useMemo(() => Country.getAllCountries(), []);

    const states = useMemo(
        () => (countryCode ? State.getStatesOfCountry(countryCode) : []),
        [countryCode]
    );

    const cities = useMemo(
        () => (countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : []),
        [countryCode, stateCode]
    );

    // Some states in the dataset have no cities listed — fall back to manual entry
    const cityDataAvailable = cities.length > 0;

    const emitChange = (next: Partial<LocationValue>) => {
        const country = countries.find((c) => c.isoCode === (next.countryCode ?? countryCode));
        const state = states.find((s) => s.isoCode === (next.stateCode ?? stateCode));

        onChange({
            country: country?.name ?? "",
            countryCode: next.countryCode ?? countryCode,
            state: state?.name ?? "",
            stateCode: next.stateCode ?? stateCode,
            city: next.city ?? city,
        });
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setCountryCode(code);
        setStateCode("");
        setCity("");
        setManualCity("");
        emitChange({ countryCode: code, stateCode: "", city: "" });
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setStateCode(code);
        setCity("");
        setManualCity("");
        emitChange({ stateCode: code, city: "" });
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setCity(value);
        emitChange({ city: value });
    };

    const handleManualCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setManualCity(value);
        emitChange({ city: value });
    };

    return (
        <div className="field-row">
            <div className="field">
                <label htmlFor="country">Country</label>
                <select id="country" value={countryCode} onChange={handleCountryChange} required>
                    <option value="" disabled>
                        Select a country
                    </option>
                    {countries.map((c) => (
                        <option key={c.isoCode} value={c.isoCode}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="field">
                <label htmlFor="state">State</label>
                <select
                    id="state"
                    value={stateCode}
                    onChange={handleStateChange}
                    required
                    disabled={!countryCode}
                >
                    <option value="" disabled>
                        {countryCode ? "Select a state" : "Select a country first"}
                    </option>
                    {states.map((s) => (
                        <option key={s.isoCode} value={s.isoCode}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="field">
                <label htmlFor="city">City</label>
                {cityDataAvailable ? (
                    <select
                        id="city"
                        value={city}
                        onChange={handleCityChange}
                        required
                        disabled={!stateCode}
                    >
                        <option value="" disabled>
                            {stateCode ? "Select a city" : "Select a state first"}
                        </option>
                        {cities.map((c) => (
                            <option key={`${c.name}-${c.latitude}-${c.longitude}`} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                ) : (
                    <>
                        <input
                            id="city"
                            type="text"
                            value={manualCity}
                            onChange={handleManualCityChange}
                            placeholder={stateCode ? "Enter city name" : "Select a state first"}
                            disabled={!stateCode}
                            required
                        />
                        {stateCode && (
                            <p className="field-hint">City not in our list — entered manually.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LocationFields;