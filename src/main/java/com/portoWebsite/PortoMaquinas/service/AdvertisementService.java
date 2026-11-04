package com.portoWebsite.PortoMaquinas.service;

import java.util.ArrayList;

import org.springframework.stereotype.Service;

import com.portoWebsite.PortoMaquinas.repository.AdvertisementRepository;

@Service 
public class AdvertisementService {
    
    AdvertisementRepository repository;

    public void createAdd(String title, String description, String productId, ArrayList<String> imgsPath){
        if(title.isBlank() || title == null){
            System.out.println("You must insert a title");
        }
        repository.createNewAd(title, description, productId, imgsPath);
    }

}
