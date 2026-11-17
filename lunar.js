document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       모달 제어
    ====================================== */

    const modal = document.getElementById("modal");
    const modalClose = document.getElementById("modalClose");
    const modalBottomClose = document.getElementById("modalBottomClose");

    const modalTitle = document.getElementById("modalTitle");
    const modalEyebrow = document.getElementById("modalEyebrow");

    const visualContent = document.getElementById("visualContent");
    const explanationContent = document.getElementById("explanationContent");

    const panels = {
        alignment: {
            visual: document.getElementById("alignmentPanel"),
            explanation: document.getElementById("alignmentExplanation"),
            title: "월식의 발생 조건",
            number: "CONCEPT 01"
        },

        redmoon: {
            visual: document.getElementById("redmoonPanel"),
            explanation: document.getElementById("redmoonExplanation"),
            title: "개기월식의 붉은색",
            number: "CONCEPT 02"
        }
    };


    function openModal(topic, action) {

        const selected = panels[topic];

        if (!selected) return;

        Object.values(panels).forEach(panel => {
            panel.visual.hidden = true;
            panel.explanation.hidden = true;
        });

        if (action === "visual") {

            visualContent.hidden = false;
            explanationContent.hidden = true;

            selected.visual.hidden = false;

            modalTitle.textContent = "시각 자료";
            modalEyebrow.textContent = selected.number + " · VISUAL";

        } else {

            visualContent.hidden = true;
            explanationContent.hidden = false;

            selected.explanation.hidden = false;

            modalTitle.textContent = selected.title;
            modalEyebrow.textContent = selected.number + " · EXPLANATION";

        }

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        modalClose.focus();

    }


    function closeModal() {

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";

    }


    document.querySelectorAll("[data-topic][data-action]").forEach(button => {

        button.addEventListener("click", () => {

            const topic = button.dataset.topic;
            const action = button.dataset.action;

            openModal(topic, action);

        });

    });


    modalClose.addEventListener("click", closeModal);
    modalBottomClose.addEventListener("click", closeModal);


    modal.addEventListener("click", event => {

        if (event.target === modal) {
            closeModal();
        }

    });


    document.addEventListener("keydown", event => {

        if (event.key === "Escape" && modal.classList.contains("active")) {
            closeModal();
        }

    });



    /* =====================================
       실험 1: 월식의 발생 조건
    ====================================== */

    const moonPosition = document.getElementById("moonPosition");
    const moonPositionValue = document.getElementById("moonPositionValue");

    const alignmentMoon = document.getElementById("alignmentMoon");
    const alignmentResult = document.getElementById("alignmentResult");
    const alignmentStatus = document.getElementById("alignmentStatus");

    const alignmentReset = document.getElementById("alignmentReset");

    const orbitCenterX = 350;
    const orbitCenterY = 195;
    const orbitRadiusX = 260;
    const orbitRadiusY = 80;
    const orbitTilt = 0;


    function updateMoonPosition() {

        const value = Number(moonPosition.value);
        const angle = value / 100 * Math.PI * 2;

        const localX = orbitRadiusX * Math.cos(angle);
        const localY = orbitRadiusY * Math.sin(angle);

        const x = orbitCenterX +
            localX * Math.cos(orbitTilt) -
            localY * Math.sin(orbitTilt);

        const y = orbitCenterY +
            localX * Math.sin(orbitTilt) +
            localY * Math.cos(orbitTilt);

        alignmentMoon.setAttribute(
            "transform",
            `translate(${x - 610}, ${y - 195})`
        );

        moonPositionValue.textContent = `${value}%`;

        const behindEarth = x > orbitCenterX + 100;
        const shadowDistance = Math.abs(y - orbitCenterY);

        const moonDisc = alignmentMoon.querySelector("circle");

        if (behindEarth && shadowDistance < 20) {

            alignmentResult.textContent = "월식이 가능한 위치";

            alignmentStatus.textContent =
                "달이 지구의 태양 반대편에 있고 그림자 중심축 부근에 있습니다. " +
                "이처럼 보름달이 궤도 교점 부근에 올 때 월식이 일어날 수 있습니다.";

            moonDisc.setAttribute("fill", "#a94c43");

        } else if (behindEarth && shadowDistance < 48) {

            alignmentResult.textContent = "그림자 가장자리 부근";

            alignmentStatus.textContent =
                "달은 지구의 반대편에 있지만 그림자 중심축에서 벗어나 있습니다. " +
                "실제 조건에 따라 반영월식 또는 부분월식이 가능할 수 있습니다.";

            moonDisc.setAttribute("fill", "#c4a5a0");

        } else {

            alignmentResult.textContent = "월식이 일어나지 않는 위치";

            alignmentStatus.textContent =
                "달이 지구 그림자의 경로를 벗어나 있습니다. " +
                "달의 공전 궤도면이 기울어져 있어 대부분의 보름달에는 월식이 일어나지 않습니다.";

            moonDisc.setAttribute("fill", "#d7d9e0");

        }

    }


    moonPosition.addEventListener("input", updateMoonPosition);


    alignmentReset.addEventListener("click", () => {

        moonPosition.value = 0;
        updateMoonPosition();

    });



    /* =====================================
       실험 2: 빛의 산란과 굴절
    ====================================== */

    const atmosphereEffect = document.getElementById("atmosphereEffect");

    const showBlueLight = document.getElementById("showBlueLight");
    const showRedLight = document.getElementById("showRedLight");

    const atmosphereLayer = document.getElementById("atmosphereLayer");

    const redRay = document.getElementById("redRay");
    const blueRay = document.getElementById("blueRay");
    const blueScatter = document.getElementById("blueScatter");

    const redMoonTarget = document.getElementById("redMoonTarget");
    const redmoonAnnotations = document.getElementById("redmoonAnnotations");

    const redmoonStatus = document.getElementById("redmoonStatus");
    const redmoonReset = document.getElementById("redmoonReset");

    const redRayLabel = Array.from(
        redmoonAnnotations.querySelectorAll("text")
    ).find(element =>
        element.textContent.trim() === "대기를 통과한 붉은빛"
    );

    const blueRayLabel = Array.from(
        redmoonAnnotations.querySelectorAll("text")
    ).find(element =>
        element.textContent.trim() === "산란된 빛"
    );

    const redAnnotationArrows = redmoonAnnotations.querySelectorAll("path");


    function updateLightPaths() {

        const atmosphereOn = atmosphereEffect.checked;
        const blueVisible = showBlueLight.checked;
        const redVisible = showRedLight.checked;

        // 대기 자체의 시각 효과
        atmosphereLayer.style.display = atmosphereOn ? "block" : "none";

        // 대기 효과가 켜져 있을 때만 빛의 경로 표시
        blueRay.style.display =
            atmosphereOn && blueVisible ? "block" : "none";

        blueScatter.style.display =
            atmosphereOn && blueVisible ? "block" : "none";

        redRay.style.display =
            atmosphereOn && redVisible ? "block" : "none";

        // 붉은빛 설명 표시
        if (redRayLabel) {
            redRayLabel.style.display =
                atmosphereOn && redVisible ? "block" : "none";
        }

        // 파란빛 설명 표시
        if (blueRayLabel) {
            blueRayLabel.style.display =
                atmosphereOn && blueVisible ? "block" : "none";
        }

        // 붉은빛 경로의 화살표 표시
        redAnnotationArrows.forEach(path => {
            path.style.display =
                atmosphereOn && redVisible ? "block" : "none";
        });

        // 대기 효과가 꺼지면 달도 어둡게 표시
        if (atmosphereOn) {
            redMoonTarget.setAttribute("fill", "url(#moonRedGradient)");
        } else {
            redMoonTarget.setAttribute("fill", "#343844");
        }

        if (!atmosphereOn) {

            redmoonStatus.textContent =
                "지구 대기 효과가 꺼져 있습니다. 대기를 통과하며 굴절되는 빛과 산란 효과가 나타나지 않습니다.";

        } else if (blueVisible && redVisible) {

            redmoonStatus.textContent =
                "파란빛은 대기에서 여러 방향으로 산란되고, " +
                "붉은빛은 상대적으로 덜 산란되고 대기에서 굴절되어 달에 도달합니다. " +
                "달 표면에서 반사된 빛이 관측자에게 들어옵니다.";

        } else if (blueVisible) {

            redmoonStatus.textContent =
                "파란빛이 대기에서 여러 방향으로 산란되는 모습을 확인할 수 있습니다.";

        } else if (redVisible) {

            redmoonStatus.textContent =
                "붉은빛은 상대적으로 산란이 적고 대기에서 굴절되어 달에 도달합니다. " +
                "달 표면에서 반사된 빛을 지구의 관측자가 보게 됩니다.";

        } else {

            redmoonStatus.textContent =
                "현재 빛의 경로가 모두 숨겨져 있습니다. 다시 표시해 보세요.";

        }

    }


    atmosphereEffect.addEventListener("change", updateLightPaths);
    showBlueLight.addEventListener("change", updateLightPaths);
    showRedLight.addEventListener("change", updateLightPaths);


    redmoonReset.addEventListener("click", () => {

        atmosphereEffect.checked = true;
        showBlueLight.checked = true;
        showRedLight.checked = true;

        updateLightPaths();

    });



    /* =====================================
       초기 상태 설정
    ====================================== */

    updateMoonPosition();
    updateLightPaths();

});