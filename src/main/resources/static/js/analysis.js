$(document).ready(function () {
    let userPk = [[${session.userPk}]];

    // 현재 날짜를 기준으로 최근 7일 범위 계산
    let today = new Date();
    let startDate = new Date();
    startDate.setDate(today.getDate() - 6);

    let startStr = `${String(startDate.getMonth() + 1).padStart(2, '0')}월 ${String(startDate.getDate()).padStart(2, '0')}일`;
    let endStr = `${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;

    $("#date-range").text(`${startStr} - ${endStr}` + " 식단 분석");

    // 사용자 정보 가져오기 (성별 & 나이)
    $.ajax({
        url: "/food/getUserDetail",
        type: "GET",
        data: { userPk: userPk },
        success: function (user) {
            let gender = user.gender;
            let age = user.age;
            let standards = getNutritionStandards(gender, age);

            // 주간 통계 가져오기
            $.ajax({
                url: "/food/weeklyStats",
                type: "GET",
                data: { userPk: userPk },
                success: function (response) {
                    let totalProtein = 0, totalCarbs = 0, totalFat = 0, totalCalories = 0;

                    response.forEach(day => {
                        totalProtein += day.totalProtein;
                        totalCarbs += day.totalCarbohydrates;
                        totalFat += day.totalFat;
                        totalCalories += day.totalCalories;
                    });

                    $("#protein-value").text(totalProtein.toFixed(2));
                    $("#carbs-value").text(totalCarbs.toFixed(2));
                    $("#fat-value").text(totalFat.toFixed(2));

                    updateCaloriesChart(totalCalories, standards.calories);
                    updateImprovementTips(totalProtein, totalCarbs, totalFat, standards);
                }
            });
        }
    });


    // 7일 기준으로 변환된 성별 & 연령별 영양소 기준
    const nutritionStandards = {
        male: {
            "19-29": { protein: 65 * 7, carbs: [356 * 7, 420 * 7], fat: [49 * 7, 101 * 7], calories: 2600 * 7 },
            "30-49": { protein: 65 * 7, carbs: [350 * 7, 410 * 7], fat: [47 * 7, 97 * 7], calories: 2500 * 7 },
            "50-64": { protein: 60 * 7, carbs: [300 * 7, 354 * 7], fat: [49 * 7, 86 * 7], calories: 2200 * 7 },
            "65-74": { protein: 60 * 7, carbs: [275 * 7, 325 * 7], fat: [44 * 7, 78 * 7], calories: 2000 * 7 }
        },
        female: {
            "19-29": { protein: 55 * 7, carbs: [275 * 7, 325 * 7], fat: [44 * 7, 78 * 7], calories: 2000 * 7 },
            "30-49": { protein: 50 * 7, carbs: [270 * 7, 318 * 7], fat: [42 * 7, 74 * 7], calories: 1900 * 7 },
            "50-64": { protein: 50 * 7, carbs: [255 * 7, 300 * 7], fat: [38 * 7, 66 * 7], calories: 1700 * 7 },
            "65-74": { protein: 50 * 7, carbs: [220 * 7, 260 * 7], fat: [36 * 7, 62 * 7], calories: 1600 * 7 }
        }
    };

    // 성별과 연령을 기준으로 권장 섭취량 반환
    function getNutritionStandards(gender, age) {
        let category = age <= 29 ? "19-29" : age <= 49 ? "30-49" : age <= 64 ? "50-64" : "65-74";
        return nutritionStandards[gender === "M" ? "male" : "female"][category];
    }



    function updateImprovementTips(protein, carbs, fat, standards) {
        let tips = [];

        // 단백질 섭취 분석
        if (protein > standards.protein) {
            tips.push("💪 <strong>단백질 섭취량이 충분합니다.</strong> 유지하세요!");
        } else if (protein < standards.protein * 0.8) {
            tips.push("⚡ <strong>단백질 섭취가 부족합니다.</strong> 닭가슴살, 두부 등 고단백 식품을 추가해보세요.");
        } else {
            tips.push("✔️ <strong>단백질 섭취가 적절합니다.</strong> 계속 유지하세요!");
        }

        // 탄수화물 섭취 분석
        if (carbs > standards.carbs[1]) {
            tips.push("🍞 <strong>탄수화물 섭취가 많습니다.</strong> 정제 탄수화물(흰쌀, 빵)보다 복합 탄수화물(현미, 고구마)을 선택하세요.");
        } else if (carbs < standards.carbs[0]) {
            tips.push("🍚 <strong>탄수화물이 부족합니다.</strong> 현미밥, 감자, 귀리 등 건강한 탄수화물을 추가하세요.");
        } else {
            tips.push("✔️ <strong>탄수화물 섭취가 적절합니다.</strong> 균형을 유지하세요!");
        }

        // 지방 섭취 분석
        if (fat > standards.fat[1]) {
            tips.push("🥑 <strong>지방 섭취량이 많습니다.</strong> 트랜스 지방 대신 견과류, 올리브오일을 선택하세요.");
        } else if (fat < standards.fat[0]) {
            tips.push("🍳 <strong>지방 섭취가 부족합니다.</strong> 아보카도, 연어, 들기름 등을 통해 건강한 지방을 보충하세요.");
        } else {
            tips.push("✔️ <strong>지방 섭취가 적절합니다.</strong> 건강한 습관을 유지하세요!");
        }

        // 피드백이 없을 경우 기본 메시지 추가
        if (tips.length === 0) {
            tips.push("<p> ✔️ <strong>이번 주 영양 섭취가 적절합니다!</strong> 계속 유지하세요!</p>");
        }

        $("#tip-text").html(tips.map(tip => `<p style="margin-bottom: 8px;">${tip}</p>`).join(""));
    }


    // 칼로리 도넛 그래프 업데이트
    function updateCaloriesChart(totalCalories, targetCalories) {
        const ctx = document.getElementById('caloriesChart').getContext('2d');

        let percentage = (totalCalories / targetCalories) * 100;
        let remainingPercentage = 100 - percentage;

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#8364DF');
        gradient.addColorStop(1, '#C084FC');

        // 기존 차트가 있다면 삭제
        if (window.caloriesChart && typeof window.caloriesChart.destroy === "function") {
            window.caloriesChart.destroy();
        }

        // 새로운 차트 생성
        window.caloriesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [percentage, remainingPercentage],
                        backgroundColor: [gradient, '#E0E0E0'],
                        borderWidth: 0,
                        cutout: '75%',
                    },
                ],
            },
            options: {
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                },
                responsive: true,
                maintainAspectRatio: false,
            },
        });

        // 기존 중앙 텍스트 삭제 후 다시 추가
        $(".chart-center-text").remove();

        const textContainer = document.createElement('div');
        textContainer.classList.add('chart-center-text');
        textContainer.innerHTML = `<p>${totalCalories.toLocaleString()} <span style="font-size: 14px; color: #999;">cal</span></p>`;

        document.querySelector('#caloriesChart').parentElement.appendChild(textContainer);
    }
});