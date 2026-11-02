package com.portoWebsite.PortoMaquinas.repository;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import com.portoWebsite.PortoMaquinas.model.Product;

//DB queries
@Repository 
public class ProductRepository {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String user;

    @Value("${spring.datasource.password}")
    private String password;

    Product product;

    public ArrayList<Product> getAllProducts(){
        String command = "SELECT * FROM products";
        ArrayList<Product> products = new ArrayList<>();

        try{
            Connection conn = DriverManager.getConnection(url, user, password);
            Statement stmt = conn.createStatement();
            
            ResultSet rs = stmt.executeQuery(command);
            System.out.println("Getting all products");

            while(rs.next()){
                Product a = new Product(rs.getString("name"), rs.getString("id"), rs.getFloat("price"), rs.getInt("quantity"));

                products.add(a); 
            }
            
            conn.close();
            return products;

        }catch(SQLException e){
            System.out.println(" ====== Error getting all products ====== ");
            e.printStackTrace();
        }

        return new ArrayList<>();
    }

    public void registerProduct(String id, String pname, BigDecimal price, int qtt) {
        String command = "INSERT INTO products (id, pname, price, qtt) VALUES (?, ?, ?, ?)";

        try (Connection conn = DriverManager.getConnection(url, user, password);
            PreparedStatement stmt = conn.prepareStatement(command)) {

            stmt.setString(1, id);
            stmt.setString(2, pname);
            stmt.setBigDecimal(3, price);
            stmt.setInt(4, qtt);

            stmt.executeUpdate();
            System.out.println("registering product");

        } catch (SQLException e) {
            System.out.println(" ====== Error registering product ====== ");
            e.printStackTrace();
        }
    }

}
