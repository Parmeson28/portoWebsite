package com.portoWebsite.PortoMaquinas.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.portoWebsite.PortoMaquinas.model.User;


@Controller
public class AdminAutController {
    public boolean logged = false;

    @GetMapping("/adminLogin")
    public String indexPage() {
        return "adminLogin";
    }

    @PostMapping("/adminLogin")
    public String postMethodName(@ModelAttribute User user) {
        if("admin".equals(user.getName()) && "123456".equals(user.getPassword())){
            return "redirect:/adminPanel";
        }else{
            System.out.println("User or Password are wrong");
            return "adminLogin";
        }
    }
    
}
