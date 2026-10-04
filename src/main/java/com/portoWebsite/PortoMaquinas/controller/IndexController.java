package com.portoWebsite.PortoMaquinas.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.portoWebsite.PortoMaquinas.model.Product;

@Controller
public class IndexController {
    
    @GetMapping("/")
    public String indexPage() {
        

        return "index";
    }
    
    @PostMapping("/save")
    public String salvarProduto(@ModelAttribute Product product){
        System.out.println(product.getName());
        System.out.println(product.getId());

        return "redirect:/";
    }

}
