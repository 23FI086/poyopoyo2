/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
/* harmony import */ var cannon_es__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! cannon-es */ "./node_modules/cannon-es/dist/cannon-es.js");
/* harmony import */ var _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tweenjs/tween.js */ "./node_modules/@tweenjs/tween.js/dist/tween.esm.js");
/* harmony import */ var three_examples_jsm_loaders_MTLLoader_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three/examples/jsm/loaders/MTLLoader.js */ "./node_modules/three/examples/jsm/loaders/MTLLoader.js");
/* harmony import */ var three_examples_jsm_loaders_OBJLoader_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! three/examples/jsm/loaders/OBJLoader.js */ "./node_modules/three/examples/jsm/loaders/OBJLoader.js");
// 23FI086　中山耀平 (ゲーム形式・最終版 v2)






class ThreeJSContainer {
    scene;
    light;
    renderer;
    camera;
    // 物理演算関連
    world;
    updateMeshList = [];
    wallMaterial;
    prizeMaterial;
    armMaterial;
    // クレーンゲーム関連
    armGroup;
    armBodies = [];
    grabbedConstraint = null;
    initialArmPosition;
    // ゲーム状態管理
    keys = {};
    isOperating = false;
    score = 0;
    gameTime = 60;
    timerId;
    // UI要素
    scoreElement;
    timerElement;
    messageElement;
    constructor() {
        this.createScene();
        this.setupUI();
        this.startGame();
    }
    setupUI() {
        const style = `position: absolute; top: 20px; left: 20px; color: white; font-size: 24px; font-family: sans-serif; text-shadow: 2px 2px 4px #000000;`;
        this.timerElement = document.createElement('div');
        this.timerElement.style.cssText = style;
        document.body.appendChild(this.timerElement);
        this.scoreElement = document.createElement('div');
        this.scoreElement.style.cssText = style;
        this.scoreElement.style.top = '50px';
        document.body.appendChild(this.scoreElement);
        this.messageElement = document.createElement('div');
        this.messageElement.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: yellow; font-size: 48px; font-family: sans-serif; text-shadow: 3px 3px 6px #000000; display: none; text-align: center;`;
        document.body.appendChild(this.messageElement);
    }
    startGame() {
        this.score = 0;
        this.gameTime = 60;
        this.isOperating = true;
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        this.messageElement.style.display = 'none';
        this.timerId = setInterval(() => {
            this.gameTime--;
            this.updateTimerDisplay();
            if (this.gameTime <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    endGame() {
        clearInterval(this.timerId);
        this.isOperating = false;
        this.messageElement.innerHTML = `ゲーム終了！<br>スコア: ${this.score}`;
        this.messageElement.style.display = 'block';
    }
    updateScoreDisplay() {
        this.scoreElement.innerText = `スコア: ${this.score}`;
    }
    updateTimerDisplay() {
        this.timerElement.innerText = `残り時間: ${this.gameTime}`;
    }
    createRendererDOM = (width, height, cameraPos) => {
        this.renderer = new three__WEBPACK_IMPORTED_MODULE_4__.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(new three__WEBPACK_IMPORTED_MODULE_4__.Color(0x495ed));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = three__WEBPACK_IMPORTED_MODULE_4__.PCFSoftShadowMap;
        this.camera = new three__WEBPACK_IMPORTED_MODULE_4__.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.copy(cameraPos);
        this.camera.lookAt(new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(0, 30, 0));
        const orbitControls = new three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__.OrbitControls(this.camera, this.renderer.domElement);
        orbitControls.target.set(0, 30, 0);
        const render = () => {
            orbitControls.update();
            this.update();
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(render);
        };
        render();
        this.renderer.domElement.style.cssFloat = "left";
        this.renderer.domElement.style.margin = "10px";
        return this.renderer.domElement;
    };
    createScene = () => {
        this.scene = new three__WEBPACK_IMPORTED_MODULE_4__.Scene();
        this.world = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.World({ gravity: new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Vec3(0, -50, 0) });
        this.wallMaterial = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Material('wall');
        this.prizeMaterial = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Material('prize');
        this.armMaterial = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Material('arm');
        const prizeWallContact = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.ContactMaterial(this.prizeMaterial, this.wallMaterial, { friction: 0.5, restitution: 0.1 });
        const prizePrizeContact = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.ContactMaterial(this.prizeMaterial, this.prizeMaterial, { friction: 0.2, restitution: 0.2 });
        const armPrizeContact = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.ContactMaterial(this.armMaterial, this.prizeMaterial, { friction: 0.9, restitution: 0.1 });
        this.world.addContactMaterial(prizeWallContact);
        this.world.addContactMaterial(prizePrizeContact);
        this.world.addContactMaterial(armPrizeContact);
        this.setupEventListeners();
        this.createContainer();
        this.createCraneArm();
        this.createGoalHole();
        this.createPrizes(5); // 最初に5個の景品を生成
        const ambientLight = new three__WEBPACK_IMPORTED_MODULE_4__.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        this.light = new three__WEBPACK_IMPORTED_MODULE_4__.DirectionalLight(0xffffff, 0.8);
        this.light.position.set(40, 60, 30);
        this.light.castShadow = true;
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.scene.add(this.light);
    };
    // --- 床の作成（ゴール地点に穴を開ける） ---
    createContainer = () => {
        const l = 100;
        const thickness = 2;
        const commonColor = 0x3366cc;
        const solidMaterial = new three__WEBPACK_IMPORTED_MODULE_4__.MeshStandardMaterial({ color: commonColor, side: three__WEBPACK_IMPORTED_MODULE_4__.DoubleSide });
        const transparentMaterial = new three__WEBPACK_IMPORTED_MODULE_4__.MeshStandardMaterial({ color: 0x999999, transparent: true, opacity: 0.1, side: three__WEBPACK_IMPORTED_MODULE_4__.DoubleSide });
        // 壁と天井
        const createWall = (size, pos, material) => {
            const geo = new three__WEBPACK_IMPORTED_MODULE_4__.BoxGeometry(...size);
            const mesh = new three__WEBPACK_IMPORTED_MODULE_4__.Mesh(geo, material);
            mesh.position.set(...pos);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            const shape = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
            const body = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Body({ mass: 0, material: this.wallMaterial });
            body.addShape(shape);
            body.position.copy(mesh.position);
            body.quaternion.copy(mesh.quaternion);
            this.world.addBody(body);
        };
        // 壁
        createWall([l, l, thickness], [0, l / 2, -l / 2 - thickness / 2], solidMaterial);
        createWall([l, thickness, l], [0, l + thickness / 2, 0], solidMaterial);
        createWall([thickness, l, l], [-l / 2 - thickness / 2, l / 2, 0], transparentMaterial);
        createWall([thickness, l, l], [l / 2 + thickness / 2, l / 2, 0], transparentMaterial);
        createWall([l, l, thickness], [0, l / 2, l / 2 + thickness / 2], transparentMaterial);
        // 穴の開いた床を作成
        const holePos = new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(-35, 0, 35);
        const holeSize = 30;
        const floorY = -thickness / 2;
        const floorPieces = [
            // x < hole.x - holeSize/2
            { x: (-l / 2 + (holePos.x - holeSize / 2)) / 2, z: 0, w: (holePos.x - holeSize / 2) + l / 2, d: l },
            // x > hole.x + holeSize/2
            { x: ((holePos.x + holeSize / 2) + l / 2) / 2, z: 0, w: l / 2 - (holePos.x + holeSize / 2), d: l },
            // z < hole.z - holeSize/2
            { x: holePos.x, z: (-l / 2 + (holePos.z - holeSize / 2)) / 2, w: holeSize, d: (holePos.z - holeSize / 2) + l / 2 },
            // z > hole.z + holeSize/2
            { x: holePos.x, z: ((holePos.z + holeSize / 2) + l / 2) / 2, w: holeSize, d: l / 2 - (holePos.z + holeSize / 2) }
        ];
        floorPieces.forEach(p => {
            createWall([p.w, thickness, p.d], [p.x, floorY, p.z], solidMaterial);
        });
    };
    createCraneArm = () => {
        this.armGroup = new three__WEBPACK_IMPORTED_MODULE_4__.Group();
        this.initialArmPosition = new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(0, 85, 0);
        this.armGroup.position.copy(this.initialArmPosition);
        this.scene.add(this.armGroup);
        const armMat = new three__WEBPACK_IMPORTED_MODULE_4__.MeshStandardMaterial({ color: 0xffff00 });
        const createArmPart = (geoSize, pos, rot) => {
            const geo = new three__WEBPACK_IMPORTED_MODULE_4__.BoxGeometry(...geoSize);
            const mesh = new three__WEBPACK_IMPORTED_MODULE_4__.Mesh(geo, armMat);
            mesh.position.set(...pos);
            mesh.rotation.set(...rot);
            mesh.castShadow = true;
            this.armGroup.add(mesh);
            const shape = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Vec3(geoSize[0] / 2, geoSize[1] / 2, geoSize[2] / 2));
            const body = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Body({ mass: 0, material: this.armMaterial });
            body.addShape(shape);
            this.armBodies.push(body);
            this.world.addBody(body);
        };
        createArmPart([20, 2, 25], [0, 0, 0], [0, 0, 0]);
        createArmPart([15, 1, 3], [-14, -5, 0], [0, 0, Math.PI / 4]);
        createArmPart([15, 1, 3], [14, -5, 0], [0, 0, -Math.PI / 4]);
        createArmPart([10, 1, 3], [-18, -14, 0], [0, 0, 3 * Math.PI / 4]);
        createArmPart([10, 1, 3], [18, -14, 0], [0, 0, -3 * Math.PI / 4]);
    };
    createPrizes = (count) => {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            const y = 10 + Math.random() * 30;
            this.createPrize(new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(x, y, z));
        }
    };
    createPrize = (position) => {
        const mtlLoader = new three_examples_jsm_loaders_MTLLoader_js__WEBPACK_IMPORTED_MODULE_2__.MTLLoader();
        mtlLoader.load('tectures/saru.mtl', (material) => {
            material.preload();
            const objLoader = new three_examples_jsm_loaders_OBJLoader_js__WEBPACK_IMPORTED_MODULE_3__.OBJLoader();
            objLoader.setMaterials(material);
            objLoader.load('tectures/saru.obj', (mesh) => {
                mesh.scale.set(10, 10, 10);
                mesh.position.copy(position);
                mesh.traverse(child => { if (child instanceof three__WEBPACK_IMPORTED_MODULE_4__.Mesh)
                    child.castShadow = true; });
                this.scene.add(mesh);
                const prizeShape = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Vec3(5, 5, 5));
                const prizeBody = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Body({
                    mass: 5,
                    position: new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Vec3(position.x, position.y, position.z),
                    material: this.prizeMaterial
                });
                prizeBody.addShape(prizeShape);
                this.world.addBody(prizeBody);
                this.updateMeshList.push({ mesh: mesh, body: prizeBody });
            });
        });
    };
    createGoalHole = () => {
        const geo = new three__WEBPACK_IMPORTED_MODULE_4__.BoxGeometry(30, 50, 30);
        const mat = new three__WEBPACK_IMPORTED_MODULE_4__.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const goalMesh = new three__WEBPACK_IMPORTED_MODULE_4__.Mesh(geo, mat);
        const goalPosition = new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(-35, -25, 35);
        goalMesh.position.copy(goalPosition);
        this.scene.add(goalMesh);
    };
    // --- 景品がスコアされた時の処理 ---
    handlePrizeScored = (prizeBody) => {
        this.score++;
        this.updateScoreDisplay();
        const itemToRemove = this.updateMeshList.find(item => item.body === prizeBody);
        if (itemToRemove) {
            this.world.removeBody(itemToRemove.body);
            this.scene.remove(itemToRemove.mesh);
            this.updateMeshList = this.updateMeshList.filter(item => item.body !== prizeBody);
            // 景品がなくなったら補充する
            if (this.updateMeshList.length === 0) {
                this.createPrizes(5);
            }
        }
    };
    setupEventListeners = () => {
        window.addEventListener("keydown", (e) => this.keys[e.key] = true);
        window.addEventListener("keyup", (e) => this.keys[e.key] = false);
        window.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && this.isOperating) {
                this.isOperating = false;
                this.startArmSequence();
            }
        });
    };
    startArmSequence = () => {
        const lowerPosition = { y: this.armGroup.position.y - 70 };
        new _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_1__.Tween(this.armGroup.position).to(lowerPosition, 2000).easing(_tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_1__.Easing.Quadratic.Out)
            .onComplete(() => {
            this.grab();
            new _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_1__.Tween(this.armGroup.position).to({ y: this.initialArmPosition.y }, 2000).easing(_tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_1__.Easing.Quadratic.In).delay(500)
                .onComplete(() => {
                const returnPosition = { x: -35, z: 35 };
                new _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_1__.Tween(this.armGroup.position).to(returnPosition, 3000).easing(_tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_1__.Easing.Sinusoidal.InOut)
                    .onComplete(() => {
                    this.release();
                    new _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_1__.Tween(this.armGroup.position).to(this.initialArmPosition, 2000).easing(_tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_1__.Easing.Sinusoidal.InOut)
                        .onComplete(() => {
                        if (this.gameTime > 0)
                            this.isOperating = true;
                    })
                        .start();
                }).start();
            }).start();
        }).start();
    };
    // --- 当たり判定を厳しくした掴む処理 ---
    grab = () => {
        let closestPrize = null;
        let minDistance = 12; // 判定距離を短くする
        const armWorldPos = new three__WEBPACK_IMPORTED_MODULE_4__.Vector3();
        this.armGroup.getWorldPosition(armWorldPos);
        for (const prize of this.updateMeshList) {
            const prizeWorldPos = new three__WEBPACK_IMPORTED_MODULE_4__.Vector3().copy(prize.body.position);
            const distance = armWorldPos.distanceTo(prizeWorldPos);
            // 水平方向の距離もチェックして、より真下にあるものだけを対象にする
            const horizontalDistance = armWorldPos.clone().setY(0).distanceTo(prizeWorldPos.clone().setY(0));
            if (distance < minDistance && horizontalDistance < 8) { // 水平距離の閾値も追加
                minDistance = distance;
                closestPrize = prize;
            }
        }
        if (closestPrize) {
            const constraint = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.LockConstraint(this.armBodies[0], closestPrize.body);
            this.world.addConstraint(constraint);
            this.grabbedConstraint = constraint;
        }
    };
    release = () => {
        if (this.grabbedConstraint) {
            this.world.removeConstraint(this.grabbedConstraint);
            this.grabbedConstraint = null;
        }
    };
    update = () => {
        const deltaTime = 1 / 60;
        this.world.step(deltaTime);
        _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_1__.update();
        // スコア判定：Y座標が一定以下の景品を処理
        const scoredBodies = [];
        for (const item of this.updateMeshList) {
            item.mesh.position.copy(item.body.position);
            item.mesh.quaternion.copy(item.body.quaternion);
            // Y座標が-10以下になったらスコア対象とする
            if (item.body.position.y < -10) {
                scoredBodies.push(item.body);
            }
        }
        // ループの外で処理することで安全にリストから削除
        for (const body of scoredBodies) {
            this.handlePrizeScored(body);
        }
        this.updateArmMovement();
        this.armBodies.forEach((body, index) => {
            const armPartMesh = this.armGroup.children[index];
            const worldPos = new three__WEBPACK_IMPORTED_MODULE_4__.Vector3();
            const worldQuat = new three__WEBPACK_IMPORTED_MODULE_4__.Quaternion();
            armPartMesh.getWorldPosition(worldPos);
            armPartMesh.getWorldQuaternion(worldQuat);
            body.position.copy(worldPos);
            body.quaternion.copy(worldQuat);
        });
    };
    updateArmMovement = () => {
        if (!this.isOperating)
            return;
        const speed = 0.5;
        const limitX = 48;
        const limitZ = 48;
        if (this.keys["ArrowUp"] && this.armGroup.position.z > -limitZ)
            this.armGroup.position.z -= speed;
        if (this.keys["ArrowDown"] && this.armGroup.position.z < limitZ)
            this.armGroup.position.z += speed;
        if (this.keys["ArrowLeft"] && this.armGroup.position.x > -limitX)
            this.armGroup.position.x -= speed;
        if (this.keys["ArrowRight"] && this.armGroup.position.x < limitX)
            this.armGroup.position.x += speed;
    };
}
window.addEventListener("DOMContentLoaded", () => {
    const container = new ThreeJSContainer();
    const viewport = container.createRendererDOM(800, 600, new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(0, 70, 120));
    document.body.appendChild(viewport);
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkcgprendering"] = self["webpackChunkcgprendering"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_tweenjs_tween_js_dist_tween_esm_js-node_modules_cannon-es_dist_cannon-es-c48bc9"], () => (__webpack_require__("./src/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhCQUE4QjtBQUNDO0FBQzJDO0FBQ3RDO0FBQ087QUFDeUI7QUFDQTtBQUVwRSxNQUFNLGdCQUFnQjtJQUNWLEtBQUssQ0FBYztJQUNuQixLQUFLLENBQWM7SUFDbkIsUUFBUSxDQUFzQjtJQUM5QixNQUFNLENBQTBCO0lBRXhDLFNBQVM7SUFDRCxLQUFLLENBQWU7SUFDcEIsY0FBYyxHQUFrRCxFQUFFLENBQUM7SUFDbkUsWUFBWSxDQUFrQjtJQUM5QixhQUFhLENBQWtCO0lBQy9CLFdBQVcsQ0FBa0I7SUFFckMsWUFBWTtJQUNKLFFBQVEsQ0FBYztJQUN0QixTQUFTLEdBQWtCLEVBQUUsQ0FBQztJQUM5QixpQkFBaUIsR0FBaUMsSUFBSSxDQUFDO0lBQ3ZELGtCQUFrQixDQUFnQjtJQUUxQyxVQUFVO0lBQ0YsSUFBSSxHQUE0QixFQUFFLENBQUM7SUFDbkMsV0FBVyxHQUFHLEtBQUssQ0FBQztJQUNwQixLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNkLE9BQU8sQ0FBTTtJQUVyQixPQUFPO0lBQ0MsWUFBWSxDQUFjO0lBQzFCLFlBQVksQ0FBYztJQUMxQixjQUFjLENBQWM7SUFHcEM7UUFDSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFTyxPQUFPO1FBQ1gsTUFBTSxLQUFLLEdBQUcsc0lBQXNJLENBQUM7UUFDckosSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDeEMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFDckMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsME1BQTBNLENBQUM7UUFDL08sUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFTyxTQUFTO1FBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBRTNDLElBQUksQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUM1QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDMUIsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ2xCO1FBQ0wsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVPLE9BQU87UUFDWCxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxHQUFHLGtCQUFrQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDL0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUNoRCxDQUFDO0lBRU8sa0JBQWtCO1FBQ3RCLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLFFBQVEsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3ZELENBQUM7SUFFTyxrQkFBa0I7UUFDdEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEdBQUcsU0FBUyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0QsQ0FBQztJQUVNLGlCQUFpQixHQUFHLENBQUMsS0FBYSxFQUFFLE1BQWMsRUFBRSxTQUF3QixFQUFFLEVBQUU7UUFDbkYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGdEQUFtQixDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksd0NBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLG1EQUFzQixDQUFDO1FBRXRELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxvREFBdUIsQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksMENBQWEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxvRkFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvRSxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRW5DLE1BQU0sTUFBTSxHQUFHLEdBQUcsRUFBRTtZQUNoQixhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUNELE1BQU0sRUFBRSxDQUFDO1FBRVQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDL0MsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztJQUNwQyxDQUFDO0lBRU8sV0FBVyxHQUFHLEdBQUcsRUFBRTtRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksd0NBQVcsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSw0Q0FBWSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksMkNBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXZFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSwrQ0FBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSwrQ0FBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSwrQ0FBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTlDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxzREFBc0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2hJLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxzREFBc0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2xJLE1BQU0sZUFBZSxHQUFHLElBQUksc0RBQXNCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUU5SCxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFL0MsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWM7UUFFcEMsTUFBTSxZQUFZLEdBQUcsSUFBSSwrQ0FBa0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLG1EQUFzQixDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDdkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRCw0QkFBNEI7SUFDcEIsZUFBZSxHQUFHLEdBQUcsRUFBRTtRQUMzQixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDZCxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDcEIsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDO1FBQzdCLE1BQU0sYUFBYSxHQUFHLElBQUksdURBQTBCLENBQUMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSw2Q0FBZ0IsRUFBRSxDQUFDLENBQUM7UUFDckcsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLHVEQUEwQixDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLDZDQUFnQixFQUFFLENBQUMsQ0FBQztRQUV6SSxPQUFPO1FBQ1AsTUFBTSxVQUFVLEdBQUcsQ0FBQyxJQUE4QixFQUFFLEdBQTZCLEVBQUUsUUFBd0IsRUFBRSxFQUFFO1lBQzNHLE1BQU0sR0FBRyxHQUFHLElBQUksOENBQWlCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUMzQyxNQUFNLElBQUksR0FBRyxJQUFJLHVDQUFVLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFckIsTUFBTSxLQUFLLEdBQUcsSUFBSSwwQ0FBVSxDQUFDLElBQUksMkNBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckYsTUFBTSxJQUFJLEdBQUcsSUFBSSwyQ0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBZSxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQWlCLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUM7UUFFRixJQUFJO1FBQ0osVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDakYsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN4RSxVQUFVLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3ZGLFVBQVUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3RGLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBRXRGLFlBQVk7UUFDWixNQUFNLE9BQU8sR0FBRyxJQUFJLDBDQUFhLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNwQixNQUFNLE1BQU0sR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFFOUIsTUFBTSxXQUFXLEdBQUc7WUFDaEIsMEJBQTBCO1lBQzFCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxRQUFRLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFDLFFBQVEsR0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDdkYsMEJBQTBCO1lBQzFCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFDLFFBQVEsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ3RGLDBCQUEwQjtZQUMxQixFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsUUFBUSxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBQyxRQUFRLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsRUFBRTtZQUNwRywwQkFBMEI7WUFDMUIsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUMsUUFBUSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUMsUUFBUSxHQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ3BHLENBQUM7UUFFRixXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ25CLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMxRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFHTyxjQUFjLEdBQUcsR0FBRyxFQUFFO1FBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx3Q0FBVyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksMENBQWEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSx1REFBMEIsQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRW5FLE1BQU0sYUFBYSxHQUFHLENBQUMsT0FBaUMsRUFBRSxHQUE2QixFQUFFLEdBQTZCLEVBQUUsRUFBRTtZQUN0SCxNQUFNLEdBQUcsR0FBRyxJQUFJLDhDQUFpQixDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDOUMsTUFBTSxJQUFJLEdBQUcsSUFBSSx1Q0FBVSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFeEIsTUFBTSxLQUFLLEdBQUcsSUFBSSwwQ0FBVSxDQUFDLElBQUksMkNBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUYsTUFBTSxJQUFJLEdBQUcsSUFBSSwyQ0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUM7UUFFRixhQUFhLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRCxhQUFhLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RCxhQUFhLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RCxhQUFhLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEUsYUFBYSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFTyxZQUFZLEdBQUcsQ0FBQyxLQUFhLEVBQUUsRUFBRTtRQUNyQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVCLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDckMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJ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QTs7VUFFQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7Ozs7V0N6QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSwrQkFBK0Isd0NBQXdDO1dBQ3ZFO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUJBQWlCLHFCQUFxQjtXQUN0QztXQUNBO1dBQ0Esa0JBQWtCLHFCQUFxQjtXQUN2QztXQUNBO1dBQ0EsS0FBSztXQUNMO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0MzQkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOzs7OztVRWhEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nLy4vc3JjL2FwcC50cyIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIDIzRkkwODbjgIDkuK3lsbHogIDlubMgKOOCsuODvOODoOW9ouW8j+ODu+acgOe1gueJiCB2MilcclxuaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XHJcbmltcG9ydCB7IE9yYml0Q29udHJvbHMgfSBmcm9tIFwidGhyZWUvZXhhbXBsZXMvanNtL2NvbnRyb2xzL09yYml0Q29udHJvbHNcIjtcclxuaW1wb3J0ICogYXMgQ0FOTk9OIGZyb20gJ2Nhbm5vbi1lcyc7XHJcbmltcG9ydCAqIGFzIFRXRUVOIGZyb20gXCJAdHdlZW5qcy90d2Vlbi5qc1wiO1xyXG5pbXBvcnQgeyBNVExMb2FkZXIgfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vbG9hZGVycy9NVExMb2FkZXIuanMnO1xyXG5pbXBvcnQgeyBPQkpMb2FkZXIgfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vbG9hZGVycy9PQkpMb2FkZXIuanMnO1xyXG5cclxuY2xhc3MgVGhyZWVKU0NvbnRhaW5lciB7XHJcbiAgICBwcml2YXRlIHNjZW5lOiBUSFJFRS5TY2VuZTtcclxuICAgIHByaXZhdGUgbGlnaHQ6IFRIUkVFLkxpZ2h0O1xyXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogVEhSRUUuV2ViR0xSZW5kZXJlcjtcclxuICAgIHByaXZhdGUgY2FtZXJhOiBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYTtcclxuICAgIFxyXG4gICAgLy8g54mp55CG5ryU566X6Zai6YCjXHJcbiAgICBwcml2YXRlIHdvcmxkOiBDQU5OT04uV29ybGQ7XHJcbiAgICBwcml2YXRlIHVwZGF0ZU1lc2hMaXN0OiB7IG1lc2g6IFRIUkVFLk9iamVjdDNELCBib2R5OiBDQU5OT04uQm9keSB9W10gPSBbXTtcclxuICAgIHByaXZhdGUgd2FsbE1hdGVyaWFsOiBDQU5OT04uTWF0ZXJpYWw7XHJcbiAgICBwcml2YXRlIHByaXplTWF0ZXJpYWw6IENBTk5PTi5NYXRlcmlhbDtcclxuICAgIHByaXZhdGUgYXJtTWF0ZXJpYWw6IENBTk5PTi5NYXRlcmlhbDtcclxuXHJcbiAgICAvLyDjgq/jg6zjg7zjg7PjgrLjg7zjg6DplqLpgKNcclxuICAgIHByaXZhdGUgYXJtR3JvdXA6IFRIUkVFLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBhcm1Cb2RpZXM6IENBTk5PTi5Cb2R5W10gPSBbXTtcclxuICAgIHByaXZhdGUgZ3JhYmJlZENvbnN0cmFpbnQ6IENBTk5PTi5Mb2NrQ29uc3RyYWludCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBpbml0aWFsQXJtUG9zaXRpb246IFRIUkVFLlZlY3RvcjM7XHJcblxyXG4gICAgLy8g44Ky44O844Og54q25oWL566h55CGXHJcbiAgICBwcml2YXRlIGtleXM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+ID0ge307XHJcbiAgICBwcml2YXRlIGlzT3BlcmF0aW5nID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIHNjb3JlID0gMDtcclxuICAgIHByaXZhdGUgZ2FtZVRpbWUgPSA2MDtcclxuICAgIHByaXZhdGUgdGltZXJJZDogYW55O1xyXG5cclxuICAgIC8vIFVJ6KaB57SgXHJcbiAgICBwcml2YXRlIHNjb3JlRWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIHRpbWVyRWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIG1lc3NhZ2VFbGVtZW50OiBIVE1MRWxlbWVudDtcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVTY2VuZSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBVSSgpO1xyXG4gICAgICAgIHRoaXMuc3RhcnRHYW1lKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc2V0dXBVSSgpIHtcclxuICAgICAgICBjb25zdCBzdHlsZSA9IGBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMjBweDsgbGVmdDogMjBweDsgY29sb3I6IHdoaXRlOyBmb250LXNpemU6IDI0cHg7IGZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmOyB0ZXh0LXNoYWRvdzogMnB4IDJweCA0cHggIzAwMDAwMDtgO1xyXG4gICAgICAgIHRoaXMudGltZXJFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgdGhpcy50aW1lckVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IHN0eWxlO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy50aW1lckVsZW1lbnQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgdGhpcy5zY29yZUVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IHN0eWxlO1xyXG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50LnN0eWxlLnRvcCA9ICc1MHB4JztcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuc2NvcmVFbGVtZW50KTtcclxuXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZUVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogNTAlOyBsZWZ0OiA1MCU7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpOyBjb2xvcjogeWVsbG93OyBmb250LXNpemU6IDQ4cHg7IGZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmOyB0ZXh0LXNoYWRvdzogM3B4IDNweCA2cHggIzAwMDAwMDsgZGlzcGxheTogbm9uZTsgdGV4dC1hbGlnbjogY2VudGVyO2A7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm1lc3NhZ2VFbGVtZW50KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzdGFydEdhbWUoKSB7XHJcbiAgICAgICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5nYW1lVGltZSA9IDYwO1xyXG4gICAgICAgIHRoaXMuaXNPcGVyYXRpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2NvcmVEaXNwbGF5KCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUaW1lckRpc3BsYXkoKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgIHRoaXMudGltZXJJZCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lVGltZS0tO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRpbWVyRGlzcGxheSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5nYW1lVGltZSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZEdhbWUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIDEwMDApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGVuZEdhbWUoKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVySWQpO1xyXG4gICAgICAgIHRoaXMuaXNPcGVyYXRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VFbGVtZW50LmlubmVySFRNTCA9IGDjgrLjg7zjg6DntYLkuobvvIE8YnI+44K544Kz44KiOiAke3RoaXMuc2NvcmV9YDtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHVwZGF0ZVNjb3JlRGlzcGxheSgpIHtcclxuICAgICAgICB0aGlzLnNjb3JlRWxlbWVudC5pbm5lclRleHQgPSBg44K544Kz44KiOiAke3RoaXMuc2NvcmV9YDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVRpbWVyRGlzcGxheSgpIHtcclxuICAgICAgICB0aGlzLnRpbWVyRWxlbWVudC5pbm5lclRleHQgPSBg5q6L44KK5pmC6ZaTOiAke3RoaXMuZ2FtZVRpbWV9YDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlUmVuZGVyZXJET00gPSAod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNhbWVyYVBvczogVEhSRUUuVmVjdG9yMykgPT4ge1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7IGFudGlhbGlhczogdHJ1ZSB9KTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFNpemUod2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRDbGVhckNvbG9yKG5ldyBUSFJFRS5Db2xvcigweDQ5NWVkKSk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXAuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXAudHlwZSA9IFRIUkVFLlBDRlNvZnRTaGFkb3dNYXA7XHJcblxyXG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDc1LCB3aWR0aCAvIGhlaWdodCwgMC4xLCAxMDAwKTtcclxuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5jb3B5KGNhbWVyYVBvcyk7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDMwLCAwKSk7XHJcblxyXG4gICAgICAgIGNvbnN0IG9yYml0Q29udHJvbHMgPSBuZXcgT3JiaXRDb250cm9scyh0aGlzLmNhbWVyYSwgdGhpcy5yZW5kZXJlci5kb21FbGVtZW50KTtcclxuICAgICAgICBvcmJpdENvbnRyb2xzLnRhcmdldC5zZXQoMCwgMzAsIDApO1xyXG5cclxuICAgICAgICBjb25zdCByZW5kZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIG9yYml0Q29udHJvbHMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlbmRlcigpO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUuY3NzRmxvYXQgPSBcImxlZnRcIjtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUubWFyZ2luID0gXCIxMHB4XCI7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNyZWF0ZVNjZW5lID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAgICAgICB0aGlzLndvcmxkID0gbmV3IENBTk5PTi5Xb3JsZCh7IGdyYXZpdHk6IG5ldyBDQU5OT04uVmVjMygwLCAtNTAsIDApIH0pO1xyXG5cclxuICAgICAgICB0aGlzLndhbGxNYXRlcmlhbCA9IG5ldyBDQU5OT04uTWF0ZXJpYWwoJ3dhbGwnKTtcclxuICAgICAgICB0aGlzLnByaXplTWF0ZXJpYWwgPSBuZXcgQ0FOTk9OLk1hdGVyaWFsKCdwcml6ZScpO1xyXG4gICAgICAgIHRoaXMuYXJtTWF0ZXJpYWwgPSBuZXcgQ0FOTk9OLk1hdGVyaWFsKCdhcm0nKTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJpemVXYWxsQ29udGFjdCA9IG5ldyBDQU5OT04uQ29udGFjdE1hdGVyaWFsKHRoaXMucHJpemVNYXRlcmlhbCwgdGhpcy53YWxsTWF0ZXJpYWwsIHsgZnJpY3Rpb246IDAuNSwgcmVzdGl0dXRpb246IDAuMSB9KTtcclxuICAgICAgICBjb25zdCBwcml6ZVByaXplQ29udGFjdCA9IG5ldyBDQU5OT04uQ29udGFjdE1hdGVyaWFsKHRoaXMucHJpemVNYXRlcmlhbCwgdGhpcy5wcml6ZU1hdGVyaWFsLCB7IGZyaWN0aW9uOiAwLjIsIHJlc3RpdHV0aW9uOiAwLjIgfSk7XHJcbiAgICAgICAgY29uc3QgYXJtUHJpemVDb250YWN0ID0gbmV3IENBTk5PTi5Db250YWN0TWF0ZXJpYWwodGhpcy5hcm1NYXRlcmlhbCwgdGhpcy5wcml6ZU1hdGVyaWFsLCB7IGZyaWN0aW9uOiAwLjksIHJlc3RpdHV0aW9uOiAwLjEgfSk7XHJcblxyXG4gICAgICAgIHRoaXMud29ybGQuYWRkQ29udGFjdE1hdGVyaWFsKHByaXplV2FsbENvbnRhY3QpO1xyXG4gICAgICAgIHRoaXMud29ybGQuYWRkQ29udGFjdE1hdGVyaWFsKHByaXplUHJpemVDb250YWN0KTtcclxuICAgICAgICB0aGlzLndvcmxkLmFkZENvbnRhY3RNYXRlcmlhbChhcm1Qcml6ZUNvbnRhY3QpO1xyXG5cclxuICAgICAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUNvbnRhaW5lcigpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlQ3JhbmVBcm0oKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUdvYWxIb2xlKCk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVQcml6ZXMoNSk7IC8vIOacgOWIneOBqzXlgIvjga7mma/lk4HjgpLnlJ/miJBcclxuXHJcbiAgICAgICAgY29uc3QgYW1iaWVudExpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZiwgMC42KTtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZChhbWJpZW50TGlnaHQpO1xyXG4gICAgICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMC44KTtcclxuICAgICAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnNldCg0MCwgNjAsIDMwKTtcclxuICAgICAgICB0aGlzLmxpZ2h0LmNhc3RTaGFkb3cgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubGlnaHQuc2hhZG93Lm1hcFNpemUud2lkdGggPSAyMDQ4O1xyXG4gICAgICAgIHRoaXMubGlnaHQuc2hhZG93Lm1hcFNpemUuaGVpZ2h0ID0gMjA0ODtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmxpZ2h0KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gLS0tIOW6iuOBruS9nOaIkO+8iOOCtOODvOODq+WcsOeCueOBq+eptOOCkumWi+OBkeOCi++8iSAtLS1cclxuICAgIHByaXZhdGUgY3JlYXRlQ29udGFpbmVyID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGwgPSAxMDA7XHJcbiAgICAgICAgY29uc3QgdGhpY2tuZXNzID0gMjtcclxuICAgICAgICBjb25zdCBjb21tb25Db2xvciA9IDB4MzM2NmNjO1xyXG4gICAgICAgIGNvbnN0IHNvbGlkTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwoeyBjb2xvcjogY29tbW9uQ29sb3IsIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUgfSk7XHJcbiAgICAgICAgY29uc3QgdHJhbnNwYXJlbnRNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCh7IGNvbG9yOiAweDk5OTk5OSwgdHJhbnNwYXJlbnQ6IHRydWUsIG9wYWNpdHk6IDAuMSwgc2lkZTogVEhSRUUuRG91YmxlU2lkZSB9KTtcclxuICAgIFxyXG4gICAgICAgIC8vIOWjgeOBqOWkqeS6lVxyXG4gICAgICAgIGNvbnN0IGNyZWF0ZVdhbGwgPSAoc2l6ZTogW251bWJlciwgbnVtYmVyLCBudW1iZXJdLCBwb3M6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSwgbWF0ZXJpYWw6IFRIUkVFLk1hdGVyaWFsKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGdlbyA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSguLi5zaXplKTtcclxuICAgICAgICAgICAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlbywgbWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBtZXNoLnBvc2l0aW9uLnNldCguLi5wb3MpO1xyXG4gICAgICAgICAgICBtZXNoLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLmFkZChtZXNoKTtcclxuICAgIFxyXG4gICAgICAgICAgICBjb25zdCBzaGFwZSA9IG5ldyBDQU5OT04uQm94KG5ldyBDQU5OT04uVmVjMyhzaXplWzBdIC8gMiwgc2l6ZVsxXSAvIDIsIHNpemVbMl0gLyAyKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoeyBtYXNzOiAwLCBtYXRlcmlhbDogdGhpcy53YWxsTWF0ZXJpYWwgfSk7XHJcbiAgICAgICAgICAgIGJvZHkuYWRkU2hhcGUoc2hhcGUpO1xyXG4gICAgICAgICAgICBib2R5LnBvc2l0aW9uLmNvcHkobWVzaC5wb3NpdGlvbiBhcyBhbnkpO1xyXG4gICAgICAgICAgICBib2R5LnF1YXRlcm5pb24uY29weShtZXNoLnF1YXRlcm5pb24gYXMgYW55KTtcclxuICAgICAgICAgICAgdGhpcy53b3JsZC5hZGRCb2R5KGJvZHkpO1xyXG4gICAgICAgIH07XHJcbiAgICBcclxuICAgICAgICAvLyDlo4FcclxuICAgICAgICBjcmVhdGVXYWxsKFtsLCBsLCB0aGlja25lc3NdLCBbMCwgbCAvIDIsIC1sIC8gMiAtIHRoaWNrbmVzcyAvIDJdLCBzb2xpZE1hdGVyaWFsKTtcclxuICAgICAgICBjcmVhdGVXYWxsKFtsLCB0aGlja25lc3MsIGxdLCBbMCwgbCArIHRoaWNrbmVzcyAvIDIsIDBdLCBzb2xpZE1hdGVyaWFsKTtcclxuICAgICAgICBjcmVhdGVXYWxsKFt0aGlja25lc3MsIGwsIGxdLCBbLWwgLyAyIC0gdGhpY2tuZXNzIC8gMiwgbCAvIDIsIDBdLCB0cmFuc3BhcmVudE1hdGVyaWFsKTtcclxuICAgICAgICBjcmVhdGVXYWxsKFt0aGlja25lc3MsIGwsIGxdLCBbbCAvIDIgKyB0aGlja25lc3MgLyAyLCBsIC8gMiwgMF0sIHRyYW5zcGFyZW50TWF0ZXJpYWwpO1xyXG4gICAgICAgIGNyZWF0ZVdhbGwoW2wsIGwsIHRoaWNrbmVzc10sIFswLCBsIC8gMiwgbCAvIDIgKyB0aGlja25lc3MgLyAyXSwgdHJhbnNwYXJlbnRNYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIC8vIOeptOOBrumWi+OBhOOBn+W6iuOCkuS9nOaIkFxyXG4gICAgICAgIGNvbnN0IGhvbGVQb3MgPSBuZXcgVEhSRUUuVmVjdG9yMygtMzUsIDAsIDM1KTtcclxuICAgICAgICBjb25zdCBob2xlU2l6ZSA9IDMwO1xyXG4gICAgICAgIGNvbnN0IGZsb29yWSA9IC10aGlja25lc3MgLyAyO1xyXG5cclxuICAgICAgICBjb25zdCBmbG9vclBpZWNlcyA9IFtcclxuICAgICAgICAgICAgLy8geCA8IGhvbGUueCAtIGhvbGVTaXplLzJcclxuICAgICAgICAgICAgeyB4OiAoLWwvMiArIChob2xlUG9zLnggLSBob2xlU2l6ZS8yKSkvMiwgejogMCwgdzogKGhvbGVQb3MueC1ob2xlU2l6ZS8yKSArIGwvMiwgZDogbCB9LFxyXG4gICAgICAgICAgICAvLyB4ID4gaG9sZS54ICsgaG9sZVNpemUvMlxyXG4gICAgICAgICAgICB7IHg6ICgoaG9sZVBvcy54ICsgaG9sZVNpemUvMikgKyBsLzIpLzIsIHo6IDAsIHc6IGwvMiAtIChob2xlUG9zLngraG9sZVNpemUvMiksIGQ6IGwgfSxcclxuICAgICAgICAgICAgLy8geiA8IGhvbGUueiAtIGhvbGVTaXplLzJcclxuICAgICAgICAgICAgeyB4OiBob2xlUG9zLngsIHo6ICgtbC8yICsgKGhvbGVQb3MueiAtIGhvbGVTaXplLzIpKS8yLCB3OiBob2xlU2l6ZSwgZDogKGhvbGVQb3Muei1ob2xlU2l6ZS8yKStsLzIgfSxcclxuICAgICAgICAgICAgLy8geiA+IGhvbGUueiArIGhvbGVTaXplLzJcclxuICAgICAgICAgICAgeyB4OiBob2xlUG9zLngsIHo6ICgoaG9sZVBvcy56K2hvbGVTaXplLzIpK2wvMikvMiwgdzogaG9sZVNpemUsIGQ6IGwvMiAtIChob2xlUG9zLnoraG9sZVNpemUvMikgfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIGZsb29yUGllY2VzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICBjcmVhdGVXYWxsKFtwLncsIHRoaWNrbmVzcywgcC5kXSwgW3AueCwgZmxvb3JZLCBwLnpdLCBzb2xpZE1hdGVyaWFsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVDcmFuZUFybSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLmFybUdyb3VwID0gbmV3IFRIUkVFLkdyb3VwKCk7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsQXJtUG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygwLCA4NSwgMCk7XHJcbiAgICAgICAgdGhpcy5hcm1Hcm91cC5wb3NpdGlvbi5jb3B5KHRoaXMuaW5pdGlhbEFybVBvc2l0aW9uKTtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmFybUdyb3VwKTtcclxuXHJcbiAgICAgICAgY29uc3QgYXJtTWF0ID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHsgY29sb3I6IDB4ZmZmZjAwIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBjcmVhdGVBcm1QYXJ0ID0gKGdlb1NpemU6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSwgcG9zOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0sIHJvdDogW251bWJlciwgbnVtYmVyLCBudW1iZXJdKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGdlbyA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSguLi5nZW9TaXplKTtcclxuICAgICAgICAgICAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlbywgYXJtTWF0KTtcclxuICAgICAgICAgICAgbWVzaC5wb3NpdGlvbi5zZXQoLi4ucG9zKTtcclxuICAgICAgICAgICAgbWVzaC5yb3RhdGlvbi5zZXQoLi4ucm90KTtcclxuICAgICAgICAgICAgbWVzaC5jYXN0U2hhZG93ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5hcm1Hcm91cC5hZGQobWVzaCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzaGFwZSA9IG5ldyBDQU5OT04uQm94KG5ldyBDQU5OT04uVmVjMyhnZW9TaXplWzBdIC8gMiwgZ2VvU2l6ZVsxXSAvIDIsIGdlb1NpemVbMl0gLyAyKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoeyBtYXNzOiAwLCBtYXRlcmlhbDogdGhpcy5hcm1NYXRlcmlhbCB9KTtcclxuICAgICAgICAgICAgYm9keS5hZGRTaGFwZShzaGFwZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXJtQm9kaWVzLnB1c2goYm9keSk7XHJcbiAgICAgICAgICAgIHRoaXMud29ybGQuYWRkQm9keShib2R5KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNyZWF0ZUFybVBhcnQoWzIwLCAyLCAyNV0sIFswLCAwLCAwXSwgWzAsIDAsIDBdKTtcclxuICAgICAgICBjcmVhdGVBcm1QYXJ0KFsxNSwgMSwgM10sIFstMTQsIC01LCAwXSwgWzAsIDAsIE1hdGguUEkgLyA0XSk7XHJcbiAgICAgICAgY3JlYXRlQXJtUGFydChbMTUsIDEsIDNdLCBbMTQsIC01LCAwXSwgWzAsIDAsIC1NYXRoLlBJIC8gNF0pO1xyXG4gICAgICAgIGNyZWF0ZUFybVBhcnQoWzEwLCAxLCAzXSwgWy0xOCwgLTE0LCAwXSwgWzAsIDAsIDMgKiBNYXRoLlBJIC8gNF0pO1xyXG4gICAgICAgIGNyZWF0ZUFybVBhcnQoWzEwLCAxLCAzXSwgWzE4LCAtMTQsIDBdLCBbMCwgMCwgLTMgKiBNYXRoLlBJIC8gNF0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGNyZWF0ZVByaXplcyA9IChjb3VudDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiA4MDtcclxuICAgICAgICAgICAgY29uc3QgeiA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDgwO1xyXG4gICAgICAgICAgICBjb25zdCB5ID0gMTAgKyBNYXRoLnJhbmRvbSgpICogMzA7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUHJpemUobmV3IFRIUkVFLlZlY3RvcjMoeCwgeSwgeikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjcmVhdGVQcml6ZSA9IChwb3NpdGlvbjogVEhSRUUuVmVjdG9yMykgPT4ge1xyXG4gICAgICAgIGNvbnN0IG10bExvYWRlciA9IG5ldyBNVExMb2FkZXIoKTtcclxuICAgICAgICBtdGxMb2FkZXIubG9hZCgndGVjdHVyZXMvc2FydS5tdGwnLCAobWF0ZXJpYWwpID0+IHtcclxuICAgICAgICAgICAgbWF0ZXJpYWwucHJlbG9hZCgpO1xyXG4gICAgICAgICAgICBjb25zdCBvYmpMb2FkZXIgPSBuZXcgT0JKTG9hZGVyKCk7XHJcbiAgICAgICAgICAgIG9iakxvYWRlci5zZXRNYXRlcmlhbHMobWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBvYmpMb2FkZXIubG9hZCgndGVjdHVyZXMvc2FydS5vYmonLCAobWVzaCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbWVzaC5zY2FsZS5zZXQoMTAsIDEwLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBtZXNoLnBvc2l0aW9uLmNvcHkocG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgbWVzaC50cmF2ZXJzZShjaGlsZCA9PiB7IGlmIChjaGlsZCBpbnN0YW5jZW9mIFRIUkVFLk1lc2gpIGNoaWxkLmNhc3RTaGFkb3cgPSB0cnVlOyB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKG1lc2gpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHByaXplU2hhcGUgPSBuZXcgQ0FOTk9OLkJveChuZXcgQ0FOTk9OLlZlYzMoNSwgNSwgNSkpOyBcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByaXplQm9keSA9IG5ldyBDQU5OT04uQm9keSh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzczogNSxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IENBTk5PTi5WZWMzKHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIHBvc2l0aW9uLnopLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hdGVyaWFsOiB0aGlzLnByaXplTWF0ZXJpYWxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcHJpemVCb2R5LmFkZFNoYXBlKHByaXplU2hhcGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53b3JsZC5hZGRCb2R5KHByaXplQm9keSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZU1lc2hMaXN0LnB1c2goeyBtZXNoOiBtZXNoLCBib2R5OiBwcml6ZUJvZHkgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlR29hbEhvbGUgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZ2VvID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDMwLCA1MCwgMzApO1xyXG4gICAgICAgIGNvbnN0IG1hdCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IGNvbG9yOiAweDAwZmYwMCwgd2lyZWZyYW1lOiB0cnVlIH0pO1xyXG4gICAgICAgIGNvbnN0IGdvYWxNZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvLCBtYXQpO1xyXG4gICAgICAgIGNvbnN0IGdvYWxQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKC0zNSwgLTI1LCAzNSk7XHJcbiAgICAgICAgZ29hbE1lc2gucG9zaXRpb24uY29weShnb2FsUG9zaXRpb24pO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKGdvYWxNZXNoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gLS0tIOaZr+WTgeOBjOOCueOCs+OCouOBleOCjOOBn+aZguOBruWHpueQhiAtLS1cclxuICAgIHByaXZhdGUgaGFuZGxlUHJpemVTY29yZWQgPSAocHJpemVCb2R5OiBDQU5OT04uQm9keSkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2NvcmUrKztcclxuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlRGlzcGxheSgpO1xyXG5cclxuICAgICAgICBjb25zdCBpdGVtVG9SZW1vdmUgPSB0aGlzLnVwZGF0ZU1lc2hMaXN0LmZpbmQoaXRlbSA9PiBpdGVtLmJvZHkgPT09IHByaXplQm9keSk7XHJcblxyXG4gICAgICAgIGlmIChpdGVtVG9SZW1vdmUpIHtcclxuICAgICAgICAgICAgdGhpcy53b3JsZC5yZW1vdmVCb2R5KGl0ZW1Ub1JlbW92ZS5ib2R5KTtcclxuICAgICAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmUoaXRlbVRvUmVtb3ZlLm1lc2gpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU1lc2hMaXN0ID0gdGhpcy51cGRhdGVNZXNoTGlzdC5maWx0ZXIoaXRlbSA9PiBpdGVtLmJvZHkgIT09IHByaXplQm9keSk7XHJcblxyXG4gICAgICAgICAgICAvLyDmma/lk4HjgYzjgarjgY/jgarjgaPjgZ/jgonoo5zlhYXjgZnjgotcclxuICAgICAgICAgICAgaWYgKHRoaXMudXBkYXRlTWVzaExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVByaXplcyg1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwRXZlbnRMaXN0ZW5lcnMgPSAoKSA9PiB7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB0aGlzLmtleXNbZS5rZXldID0gdHJ1ZSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoZSkgPT4gdGhpcy5rZXlzW2Uua2V5XSA9IGZhbHNlKTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIgJiYgdGhpcy5pc09wZXJhdGluZykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc09wZXJhdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydEFybVNlcXVlbmNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXJ0QXJtU2VxdWVuY2UgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbG93ZXJQb3NpdGlvbiA9IHsgeTogdGhpcy5hcm1Hcm91cC5wb3NpdGlvbi55IC0gNzAgfTtcclxuICAgICAgICBcclxuICAgICAgICBuZXcgVFdFRU4uVHdlZW4odGhpcy5hcm1Hcm91cC5wb3NpdGlvbikudG8obG93ZXJQb3NpdGlvbiwgMjAwMCkuZWFzaW5nKFRXRUVOLkVhc2luZy5RdWFkcmF0aWMuT3V0KVxyXG4gICAgICAgICAgICAub25Db21wbGV0ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdyYWIoKTtcclxuICAgICAgICAgICAgICAgIG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmFybUdyb3VwLnBvc2l0aW9uKS50byh7IHk6IHRoaXMuaW5pdGlhbEFybVBvc2l0aW9uLnkgfSwgMjAwMCkuZWFzaW5nKFRXRUVOLkVhc2luZy5RdWFkcmF0aWMuSW4pLmRlbGF5KDUwMClcclxuICAgICAgICAgICAgICAgICAgICAub25Db21wbGV0ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJldHVyblBvc2l0aW9uID0geyB4OiAtMzUsIHo6IDM1IH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmFybUdyb3VwLnBvc2l0aW9uKS50byhyZXR1cm5Qb3NpdGlvbiwgMzAwMCkuZWFzaW5nKFRXRUVOLkVhc2luZy5TaW51c29pZGFsLkluT3V0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVsZWFzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmFybUdyb3VwLnBvc2l0aW9uKS50byh0aGlzLmluaXRpYWxBcm1Qb3NpdGlvbiwgMjAwMCkuZWFzaW5nKFRXRUVOLkVhc2luZy5TaW51c29pZGFsLkluT3V0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAub25Db21wbGV0ZSgoKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmdhbWVUaW1lID4gMCkgdGhpcy5pc09wZXJhdGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuc3RhcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KS5zdGFydCgpO1xyXG4gICAgICAgICAgICB9KS5zdGFydCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyAtLS0g5b2T44Gf44KK5Yik5a6a44KS5Y6z44GX44GP44GX44Gf5o6044KA5Yem55CGIC0tLVxyXG4gICAgcHJpdmF0ZSBncmFiID0gKCkgPT4ge1xyXG4gICAgICAgIGxldCBjbG9zZXN0UHJpemU6IHsgbWVzaDogVEhSRUUuT2JqZWN0M0QsIGJvZHk6IENBTk5PTi5Cb2R5IH0gfCBudWxsID0gbnVsbDtcclxuICAgICAgICBsZXQgbWluRGlzdGFuY2UgPSAxMjsgLy8g5Yik5a6a6Led6Zui44KS55+t44GP44GZ44KLXHJcblxyXG4gICAgICAgIGNvbnN0IGFybVdvcmxkUG9zID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgICAgICB0aGlzLmFybUdyb3VwLmdldFdvcmxkUG9zaXRpb24oYXJtV29ybGRQb3MpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAoY29uc3QgcHJpemUgb2YgdGhpcy51cGRhdGVNZXNoTGlzdCkge1xyXG4gICAgICAgICAgICBjb25zdCBwcml6ZVdvcmxkUG9zID0gbmV3IFRIUkVFLlZlY3RvcjMoKS5jb3B5KHByaXplLmJvZHkucG9zaXRpb24gYXMgYW55KTtcclxuICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBhcm1Xb3JsZFBvcy5kaXN0YW5jZVRvKHByaXplV29ybGRQb3MpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8g5rC05bmz5pa55ZCR44Gu6Led6Zui44KC44OB44Kn44OD44Kv44GX44Gm44CB44KI44KK55yf5LiL44Gr44GC44KL44KC44Gu44Gg44GR44KS5a++6LGh44Gr44GZ44KLXHJcbiAgICAgICAgICAgIGNvbnN0IGhvcml6b250YWxEaXN0YW5jZSA9IGFybVdvcmxkUG9zLmNsb25lKCkuc2V0WSgwKS5kaXN0YW5jZVRvKHByaXplV29ybGRQb3MuY2xvbmUoKS5zZXRZKDApKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IG1pbkRpc3RhbmNlICYmIGhvcml6b250YWxEaXN0YW5jZSA8IDgpIHsgLy8g5rC05bmz6Led6Zui44Gu6Za+5YCk44KC6L+95YqgXHJcbiAgICAgICAgICAgICAgICBtaW5EaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgY2xvc2VzdFByaXplID0gcHJpemU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjbG9zZXN0UHJpemUpIHtcclxuICAgICAgICAgICAgY29uc3QgY29uc3RyYWludCA9IG5ldyBDQU5OT04uTG9ja0NvbnN0cmFpbnQodGhpcy5hcm1Cb2RpZXNbMF0sIGNsb3Nlc3RQcml6ZS5ib2R5KTtcclxuICAgICAgICAgICAgdGhpcy53b3JsZC5hZGRDb25zdHJhaW50KGNvbnN0cmFpbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmdyYWJiZWRDb25zdHJhaW50ID0gY29uc3RyYWludDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWxlYXNlID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLmdyYWJiZWRDb25zdHJhaW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMud29ybGQucmVtb3ZlQ29uc3RyYWludCh0aGlzLmdyYWJiZWRDb25zdHJhaW50KTtcclxuICAgICAgICAgICAgdGhpcy5ncmFiYmVkQ29uc3RyYWludCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdXBkYXRlID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRlbHRhVGltZSA9IDEgLyA2MDtcclxuICAgICAgICB0aGlzLndvcmxkLnN0ZXAoZGVsdGFUaW1lKTtcclxuICAgICAgICBUV0VFTi51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgLy8g44K544Kz44Ki5Yik5a6a77yaWeW6p+aomeOBjOS4gOWumuS7peS4i+OBruaZr+WTgeOCkuWHpueQhlxyXG4gICAgICAgIGNvbnN0IHNjb3JlZEJvZGllczogQ0FOTk9OLkJvZHlbXSA9IFtdO1xyXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLnVwZGF0ZU1lc2hMaXN0KSB7XHJcbiAgICAgICAgICAgIGl0ZW0ubWVzaC5wb3NpdGlvbi5jb3B5KGl0ZW0uYm9keS5wb3NpdGlvbiBhcyBhbnkpO1xyXG4gICAgICAgICAgICBpdGVtLm1lc2gucXVhdGVybmlvbi5jb3B5KGl0ZW0uYm9keS5xdWF0ZXJuaW9uIGFzIGFueSk7XHJcblxyXG4gICAgICAgICAgICAvLyBZ5bqn5qiZ44GMLTEw5Lul5LiL44Gr44Gq44Gj44Gf44KJ44K544Kz44Ki5a++6LGh44Go44GZ44KLXHJcbiAgICAgICAgICAgIGlmIChpdGVtLmJvZHkucG9zaXRpb24ueSA8IC0xMCkge1xyXG4gICAgICAgICAgICAgICAgc2NvcmVkQm9kaWVzLnB1c2goaXRlbS5ib2R5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDjg6vjg7zjg5fjga7lpJbjgaflh6bnkIbjgZnjgovjgZPjgajjgaflronlhajjgavjg6rjgrnjg4jjgYvjgonliYrpmaRcclxuICAgICAgICBmb3IgKGNvbnN0IGJvZHkgb2Ygc2NvcmVkQm9kaWVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUHJpemVTY29yZWQoYm9keSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUFybU1vdmVtZW50KCk7XHJcblxyXG4gICAgICAgIHRoaXMuYXJtQm9kaWVzLmZvckVhY2goKGJvZHksIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFybVBhcnRNZXNoID0gdGhpcy5hcm1Hcm91cC5jaGlsZHJlbltpbmRleF0gYXMgVEhSRUUuTWVzaDtcclxuICAgICAgICAgICAgY29uc3Qgd29ybGRQb3MgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgICAgICAgICBjb25zdCB3b3JsZFF1YXQgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xyXG4gICAgICAgICAgICBhcm1QYXJ0TWVzaC5nZXRXb3JsZFBvc2l0aW9uKHdvcmxkUG9zKTtcclxuICAgICAgICAgICAgYXJtUGFydE1lc2guZ2V0V29ybGRRdWF0ZXJuaW9uKHdvcmxkUXVhdCk7XHJcbiAgICAgICAgICAgIGJvZHkucG9zaXRpb24uY29weSh3b3JsZFBvcyBhcyBhbnkpO1xyXG4gICAgICAgICAgICBib2R5LnF1YXRlcm5pb24uY29weSh3b3JsZFF1YXQgYXMgYW55KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZUFybU1vdmVtZW50ID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICghdGhpcy5pc09wZXJhdGluZykgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBzcGVlZCA9IDAuNTtcclxuICAgICAgICBjb25zdCBsaW1pdFggPSA0ODtcclxuICAgICAgICBjb25zdCBsaW1pdFogPSA0ODtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMua2V5c1tcIkFycm93VXBcIl0gJiYgdGhpcy5hcm1Hcm91cC5wb3NpdGlvbi56ID4gLWxpbWl0WikgdGhpcy5hcm1Hcm91cC5wb3NpdGlvbi56IC09IHNwZWVkO1xyXG4gICAgICAgIGlmICh0aGlzLmtleXNbXCJBcnJvd0Rvd25cIl0gJiYgdGhpcy5hcm1Hcm91cC5wb3NpdGlvbi56IDwgbGltaXRaKSB0aGlzLmFybUdyb3VwLnBvc2l0aW9uLnogKz0gc3BlZWQ7XHJcbiAgICAgICAgaWYgKHRoaXMua2V5c1tcIkFycm93TGVmdFwiXSAmJiB0aGlzLmFybUdyb3VwLnBvc2l0aW9uLnggPiAtbGltaXRYKSB0aGlzLmFybUdyb3VwLnBvc2l0aW9uLnggLT0gc3BlZWQ7XHJcbiAgICAgICAgaWYgKHRoaXMua2V5c1tcIkFycm93UmlnaHRcIl0gJiYgdGhpcy5hcm1Hcm91cC5wb3NpdGlvbi54IDwgbGltaXRYKSB0aGlzLmFybUdyb3VwLnBvc2l0aW9uLnggKz0gc3BlZWQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSBuZXcgVGhyZWVKU0NvbnRhaW5lcigpO1xyXG4gICAgY29uc3Qgdmlld3BvcnQgPSBjb250YWluZXIuY3JlYXRlUmVuZGVyZXJET00oODAwLCA2MDAsIG5ldyBUSFJFRS5WZWN0b3IzKDAsIDcwLCAxMjApKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodmlld3BvcnQpO1xyXG59KTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJtYWluXCI6IDBcbn07XG5cbi8vIG5vIGNodW5rIG9uIGRlbWFuZCBsb2FkaW5nXG5cbi8vIG5vIHByZWZldGNoaW5nXG5cbi8vIG5vIHByZWxvYWRlZFxuXG4vLyBubyBITVJcblxuLy8gbm8gSE1SIG1hbmlmZXN0XG5cbl9fd2VicGFja19yZXF1aXJlX18uTy5qID0gKGNodW5rSWQpID0+IChpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPT09IDApO1xuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgW2NodW5rSWRzLCBtb3JlTW9kdWxlcywgcnVudGltZV0gPSBkYXRhO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uTyhyZXN1bHQpO1xufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua2NncHJlbmRlcmluZ1wiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtjZ3ByZW5kZXJpbmdcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInZlbmRvcnMtbm9kZV9tb2R1bGVzX3R3ZWVuanNfdHdlZW5fanNfZGlzdF90d2Vlbl9lc21fanMtbm9kZV9tb2R1bGVzX2Nhbm5vbi1lc19kaXN0X2Nhbm5vbi1lcy1jNDhiYzlcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYXBwLnRzXCIpKSlcbl9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8oX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=