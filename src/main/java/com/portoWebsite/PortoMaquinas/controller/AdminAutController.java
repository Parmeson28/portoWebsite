package com.portoWebsite.PortoMaquinas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.portoWebsite.PortoMaquinas.helpers.UserAutentication;
import com.portoWebsite.PortoMaquinas.model.User;


@Controller
public class AdminAutController {
    @Autowired 
    UserAutentication userAut;

    @GetMapping("/adminLogin")
    public String indexPage() {
        return "adminLogin";
    }

    @PostMapping("/adminLogin")
    public String postMethodName(@ModelAttribute User user) {
        System.out.println("Received: '" + user.getName() + "' / '" + user.getPassword() + "'");
        if("admin".equals(user.getName()) && "123456".equals(user.getPassword())){
            userAut.setLogged(true);
            System.out.println("Log 1");
            System.out.println(userAut.getLogged());
            return "redirect:/adminPanel";
        }else{
            System.out.println("User or Password are wrong");
            return "adminLogin";
        }
    }
    
}
