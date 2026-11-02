package com.portoWebsite.PortoMaquinas.model;

import java.util.ArrayList;

public class Advertisement {
    private String title, description, productId;
    private ArrayList<String> imgsPath = new ArrayList<>();
    private int id;

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

}