package com.portoWebsite.PortoMaquinas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.portoWebsite.PortoMaquinas.helpers.UserAutentication;

@Controller
public class AdminController {

    @Autowired
    UserAutentication userAut;
    boolean logged;

    @GetMapping("/adminPanel")
    public String indexPage() {
        logged = userAut.getLogged();
        System.out.println("Log 2");
        System.out.println(logged);
        if(!logged){
            return "redirect:/adminLogin";
        }
        return "adminPanel";
    }
    
}
