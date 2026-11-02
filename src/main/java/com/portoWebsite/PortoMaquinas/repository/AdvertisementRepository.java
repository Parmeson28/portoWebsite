package com.portoWebsite.PortoMaquinas.repository;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Value;

import com.portoWebsite.PortoMaquinas.model.Product;

public class AdvertisementRepository {
    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String user;

    @Value("${spring.datasource.password}")
    private String password;

    Product product;
    
    public void createNewAd(String title, String description, String productId, ArrayList<String> imgsPath) {
        String command = "INSERT INTO products (title, addescription, productid, imgspath) VALUES (?, ?, ?, ?)";

        try (Connection conn = DriverManager.getConnection(url, user, password);
            PreparedStatement stmt = conn.prepareStatement(command)) {

            stmt.setString(1, title);
            stmt.setString(2, description);
            stmt.setString(3, productId);
            stmt.setArray(4, conn.createArrayOf("text", imgsPath.toArray()));

            stmt.executeUpdate();
            System.out.println("registering product");

        } catch (SQLException e) {
            System.out.println(" ====== Error registering product ====== ");
            e.printStackTrace();
        }
    }
}
