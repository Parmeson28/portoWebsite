package com.portoWebsite.PortoMaquinas.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.portoWebsite.PortoMaquinas.model.Advertisement;
import com.portoWebsite.PortoMaquinas.repository.AdvertisementRepository;

@Service
public class AdvertisementService {

    @Autowired
    AdvertisementRepository repository;

    public void createAd(String title, String description, Float price, Integer quantity, Boolean available) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("O título é obrigatório");
        }
        repository.createNewAd(title, description, price, quantity, available);
    }

    public List<Advertisement> findAll() {
        return repository.findAll();
    }
}