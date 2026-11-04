package com.portoWebsite.PortoMaquinas.repository;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import com.portoWebsite.PortoMaquinas.model.Advertisement;

@Repository
public class AdvertisementRepository {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String user;

    @Value("${spring.datasource.password}")
    private String password;

    public void createNewAd(String title, String description, Float price, Integer quantity, Boolean available) {
        String command = "INSERT INTO advertisements (title, addescription, price, quantity, available) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DriverManager.getConnection(url, user, password);
            PreparedStatement stmt = conn.prepareStatement(command)) {

            stmt.setString(1, title);
            stmt.setString(2, description);
            stmt.setFloat(3, price);
            stmt.setInt(4, quantity);
            stmt.setBoolean(5, available);
            stmt.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao registrar anúncio: " + e.getMessage(), e);
        }
    }   

    public List<Advertisement> findAll() {
        String command = "SELECT id, title, addescription, price, quantity, available FROM advertisements ORDER BY id DESC";
        List<Advertisement> ads = new ArrayList<>();

        try (Connection conn = DriverManager.getConnection(url, user, password);
             PreparedStatement stmt = conn.prepareStatement(command);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Advertisement ad = new Advertisement();
                ad.setId(rs.getInt("id"));
                ad.setTitle(rs.getString("title"));
                ad.setDescription(rs.getString("addescription"));
                ad.setPrice(rs.getFloat("price"));
                ad.setQuantity(rs.getInt("quantity"));
                ad.setAvailable(rs.getBoolean("available"));
                ads.add(ad);
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar anúncios", e);
        }

        return ads;
    }
}