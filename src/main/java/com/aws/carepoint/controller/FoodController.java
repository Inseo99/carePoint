package com.aws.carepoint.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/food")
public class FoodController {

    @GetMapping("/foodRecord")
    public String showRecordPage() {

        return "food/foodRecord"; // templates/food/foodRecord.html
    }

    @GetMapping("/foodList")
    public String showListPage() {

        return "food/foodList"; // templates/food/foodList.html
    }

    @GetMapping("/analysis")
    public String showAnalysisPage() {

        return "food/analysis"; // templates/food/analysis.html
    }

    @GetMapping("/detail")
    public String showDetailPage() {

        return "food/detail"; // templates/food/analysis.html
    }

    @GetMapping("/recom")
    public String showRecomPage() {

        return "food/recom"; // templates/food/analysis.html
    }

    @GetMapping("/recomResult")
    public String showRecomResultPage() {

        return "food/recomResult"; // templates/food/analysis.html
    }

    @GetMapping("/write")
    public String showWritePage() {

        return "food/write"; // templates/food/analysis.html
    }


    }



