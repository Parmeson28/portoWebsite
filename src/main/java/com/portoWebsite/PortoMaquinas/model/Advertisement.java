package com.portoWebsite.PortoMaquinas.model;

import java.util.ArrayList;

public class Advertisement {

    private String title, description, productId;
    private ArrayList<String> imgsPath = new ArrayList<>();
    private Integer id, quantity;
    private Product product;
    private Float price;
    private boolean available;

    public Advertisement(String title, String description, String productId, ArrayList<String> imgsPath) {
        this.title = title;
        this.description = description;
        this.productId = productId;
        this.imgsPath = imgsPath;
    }

    public Advertisement(String title, String description, String productId) {
        this.title = title;
        this.description = description;
        this.productId = productId;
    }

    public Advertisement(Product product, String description) {
        this.product = product;
        this.description = description;
    }
    public Advertisement() {
        this.product = product;
        this.description = description;
    }

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

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public Float getPrice() {
        return price;
    }

    public void setPrice(Float price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    

}