package com.portoWebsite.PortoMaquinas.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;


@Controller
public class AdminController {

    @PostMapping("/adminPanel")
    public String indexPage() {
        return "adminPanel";
    }

    @GetMapping("/adminPanel")
    public String getMethodName() {
        return "redirect:/adminLogin";
    }
    
   
}
