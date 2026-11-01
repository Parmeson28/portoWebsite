package com.portoWebsite.PortoMaquinas.model;

public class User {
    private String name, password;
    private int id, permissionLvl;


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getPermissionLvl() {
        return permissionLvl;
    }

    public void setPermissionLvl(int permissionLvl) {
        this.permissionLvl = permissionLvl;
    }

}
