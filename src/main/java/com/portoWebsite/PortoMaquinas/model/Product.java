package com.portoWebsite.PortoMaquinas.model;

public class Product {
    private String name, id;
    private float price;
    private int quantity;

    public Product(String name, String id, float price, int quantity){
        this.name = name;
        this.id = id;
        this.price = price;
        this.quantity = quantity;
    }


    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public float getPrice() {
        return price;
    }
    public void setPrice(float price) {
        this.price = price;
    }
    public int getQuantity() {
        return quantity;
    }
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
