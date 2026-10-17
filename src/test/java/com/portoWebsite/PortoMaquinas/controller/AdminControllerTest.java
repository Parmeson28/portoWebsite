package com.portoWebsite.PortoMaquinas.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.portoWebsite.PortoMaquinas.helpers.UserAutentication;

class AdminControllerTest {
    private UserAutentication userAut;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        userAut = new UserAutentication();
        AdminController controller = new AdminController();
        controller.userAut = userAut;
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void productPreviewRequiresAdminLogin() throws Exception {
        mvc.perform(get("/admin/products/preview"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/adminLogin"));
    }

    @Test
    void loggedInAdminCanOpenProductPreview() throws Exception {
        userAut.setLogged(true);
        mvc.perform(get("/admin/products/preview"))
                .andExpect(status().isOk())
                .andExpect(view().name("adminProductPreview"));
    }
}
