package com.portoWebsite.PortoMaquinas.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.portoWebsite.PortoMaquinas.helpers.UserAutentication;
import com.portoWebsite.PortoMaquinas.model.Advertisement;
import com.portoWebsite.PortoMaquinas.service.AdvertisementService;

@Controller
public class AdminController {

    @Autowired
    UserAutentication userAut;

    @Autowired
    AdvertisementService advertisementService;

    @GetMapping("/adminPanel")
    public String indexPage() {
        if (!userAut.getLogged()) {
            return "redirect:/adminLogin";
        }
        return "adminPanel";
    }

    @GetMapping("/adminPanel/advertisements")
    public String listAdvertisements(Model model) {
        if (!userAut.getLogged()) {
            return "redirect:/adminLogin";
        }
        List<Advertisement> ads = advertisementService.findAll();
        model.addAttribute("ads", ads);
        return "adminAdvertisements";
    }

    @GetMapping("/admin/advertisements/new")
    public String newAdvertisementForm() {
        if (!userAut.getLogged()) {
            return "redirect:/adminLogin";
        }
        return "adminAdvertisementNew";
    }

    @PostMapping("/adminPanel/advertisements")
    public String saveAdvertisement(
            @RequestParam String title,
            @RequestParam Float price,
            @RequestParam Integer quantity,
            @RequestParam Boolean available,
            @RequestParam String description,
            RedirectAttributes redirectAttributes) {

        if (!userAut.getLogged()) {
            return "redirect:/adminLogin";
        }

        try {
            advertisementService.createAd(title, description, price, quantity, available);
            redirectAttributes.addFlashAttribute("success", "Anúncio cadastrado com sucesso!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Erro ao cadastrar anúncio: " + e.getMessage());
        }

        return "redirect:/adminPanel/advertisements";
    }
}