package com.portoWebsite.PortoMaquinas.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.portoWebsite.PortoMaquinas.model.User;

@Controller
public class AdminController {
     @GetMapping("/admin")
    public String indexPage() {
        return "admin";
    }
    
    @PostMapping("/admin/panel")
    public String salvarProduto(@ModelAttribute User user){
        System.out.println(user.getName());
        System.out.println(user.getPassword());

        if(user.getPassword().equals("12345")){
            return "redirect:/admin/panel";
        }else{
            System.out.println("Senha incorreta");
            return "redirect:/admin";
        }
    }
}
