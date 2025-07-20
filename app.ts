// 23FI086　中山耀平 (ゲーム形式・最終版 v2)
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from 'cannon-es';
import * as TWEEN from "@tweenjs/tween.js";
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

class ThreeJSContainer {
    private scene: THREE.Scene;
    private light: THREE.Light;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    
    // 物理演算関連
    private world: CANNON.World;
    private updateMeshList: { mesh: THREE.Object3D, body: CANNON.Body }[] = [];
    private wallMaterial: CANNON.Material;
    private prizeMaterial: CANNON.Material;
    private armMaterial: CANNON.Material;

    // クレーンゲーム関連
    private armGroup: THREE.Group;
    private armBodies: CANNON.Body[] = [];
    private grabbedConstraint: CANNON.LockConstraint | null = null;
    private initialArmPosition: THREE.Vector3;

    // ゲーム状態管理
    private keys: Record<string, boolean> = {};
    private isOperating = false;
    private score = 0;
    private gameTime = 60;
    private timerId: any;

    // UI要素
    private scoreElement: HTMLElement;
    private timerElement: HTMLElement;
    private messageElement: HTMLElement;


    constructor() {
        this.createScene();
        this.setupUI();
        this.startGame();
    }
    
    private setupUI() {
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
    
    private startGame() {
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
    
    private endGame() {
        clearInterval(this.timerId);
        this.isOperating = false;
        this.messageElement.innerHTML = `ゲーム終了！<br>スコア: ${this.score}`;
        this.messageElement.style.display = 'block';
    }
    
    private updateScoreDisplay() {
        this.scoreElement.innerText = `スコア: ${this.score}`;
    }

    private updateTimerDisplay() {
        this.timerElement.innerText = `残り時間: ${this.gameTime}`;
    }

    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(new THREE.Color(0x495ed));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.copy(cameraPos);
        this.camera.lookAt(new THREE.Vector3(0, 30, 0));

        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        orbitControls.target.set(0, 30, 0);

        const render = () => {
            orbitControls.update();
            this.update();
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(render);
        }
        render();

        this.renderer.domElement.style.cssFloat = "left";
        this.renderer.domElement.style.margin = "10px";
        return this.renderer.domElement;
    }

    private createScene = () => {
        this.scene = new THREE.Scene();
        this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -50, 0) });

        this.wallMaterial = new CANNON.Material('wall');
        this.prizeMaterial = new CANNON.Material('prize');
        this.armMaterial = new CANNON.Material('arm');

        const prizeWallContact = new CANNON.ContactMaterial(this.prizeMaterial, this.wallMaterial, { friction: 0.5, restitution: 0.1 });
        const prizePrizeContact = new CANNON.ContactMaterial(this.prizeMaterial, this.prizeMaterial, { friction: 0.2, restitution: 0.2 });
        const armPrizeContact = new CANNON.ContactMaterial(this.armMaterial, this.prizeMaterial, { friction: 0.9, restitution: 0.1 });

        this.world.addContactMaterial(prizeWallContact);
        this.world.addContactMaterial(prizePrizeContact);
        this.world.addContactMaterial(armPrizeContact);

        this.setupEventListeners();
        this.createContainer();
        this.createCraneArm();
        this.createGoalHole();
        this.createPrizes(5); // 最初に5個の景品を生成

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        this.light = new THREE.DirectionalLight(0xffffff, 0.8);
        this.light.position.set(40, 60, 30);
        this.light.castShadow = true;
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.scene.add(this.light);
    }
    
    // --- 床の作成（ゴール地点に穴を開ける） ---
    private createContainer = () => {
        const l = 100;
        const thickness = 2;
        const commonColor = 0x3366cc;
        const solidMaterial = new THREE.MeshStandardMaterial({ color: commonColor, side: THREE.DoubleSide });
        const transparentMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    
        // 壁と天井
        const createWall = (size: [number, number, number], pos: [number, number, number], material: THREE.Material) => {
            const geo = new THREE.BoxGeometry(...size);
            const mesh = new THREE.Mesh(geo, material);
            mesh.position.set(...pos);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
    
            const shape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
            const body = new CANNON.Body({ mass: 0, material: this.wallMaterial });
            body.addShape(shape);
            body.position.copy(mesh.position as any);
            body.quaternion.copy(mesh.quaternion as any);
            this.world.addBody(body);
        };
    
        // 壁
        createWall([l, l, thickness], [0, l / 2, -l / 2 - thickness / 2], solidMaterial);
        createWall([l, thickness, l], [0, l + thickness / 2, 0], solidMaterial);
        createWall([thickness, l, l], [-l / 2 - thickness / 2, l / 2, 0], transparentMaterial);
        createWall([thickness, l, l], [l / 2 + thickness / 2, l / 2, 0], transparentMaterial);
        createWall([l, l, thickness], [0, l / 2, l / 2 + thickness / 2], transparentMaterial);

        // 穴の開いた床を作成
        const holePos = new THREE.Vector3(-35, 0, 35);
        const holeSize = 30;
        const floorY = -thickness / 2;

        const floorPieces = [
            // x < hole.x - holeSize/2
            { x: (-l/2 + (holePos.x - holeSize/2))/2, z: 0, w: (holePos.x-holeSize/2) + l/2, d: l },
            // x > hole.x + holeSize/2
            { x: ((holePos.x + holeSize/2) + l/2)/2, z: 0, w: l/2 - (holePos.x+holeSize/2), d: l },
            // z < hole.z - holeSize/2
            { x: holePos.x, z: (-l/2 + (holePos.z - holeSize/2))/2, w: holeSize, d: (holePos.z-holeSize/2)+l/2 },
            // z > hole.z + holeSize/2
            { x: holePos.x, z: ((holePos.z+holeSize/2)+l/2)/2, w: holeSize, d: l/2 - (holePos.z+holeSize/2) }
        ];

        floorPieces.forEach(p => {
             createWall([p.w, thickness, p.d], [p.x, floorY, p.z], solidMaterial);
        });
    }


    private createCraneArm = () => {
        this.armGroup = new THREE.Group();
        this.initialArmPosition = new THREE.Vector3(0, 85, 0);
        this.armGroup.position.copy(this.initialArmPosition);
        this.scene.add(this.armGroup);

        const armMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });

        const createArmPart = (geoSize: [number, number, number], pos: [number, number, number], rot: [number, number, number]) => {
            const geo = new THREE.BoxGeometry(...geoSize);
            const mesh = new THREE.Mesh(geo, armMat);
            mesh.position.set(...pos);
            mesh.rotation.set(...rot);
            mesh.castShadow = true;
            this.armGroup.add(mesh);

            const shape = new CANNON.Box(new CANNON.Vec3(geoSize[0] / 2, geoSize[1] / 2, geoSize[2] / 2));
            const body = new CANNON.Body({ mass: 0, material: this.armMaterial });
            body.addShape(shape);
            this.armBodies.push(body);
            this.world.addBody(body);
        };
        
        createArmPart([20, 2, 25], [0, 0, 0], [0, 0, 0]);
        createArmPart([15, 1, 3], [-14, -5, 0], [0, 0, Math.PI / 4]);
        createArmPart([15, 1, 3], [14, -5, 0], [0, 0, -Math.PI / 4]);
        createArmPart([10, 1, 3], [-18, -14, 0], [0, 0, 3 * Math.PI / 4]);
        createArmPart([10, 1, 3], [18, -14, 0], [0, 0, -3 * Math.PI / 4]);
    }
    
    private createPrizes = (count: number) => {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            const y = 10 + Math.random() * 30;
            this.createPrize(new THREE.Vector3(x, y, z));
        }
    }
    
    private createPrize = (position: THREE.Vector3) => {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('textures/saru.mtl', (material) => {
            material.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(material);
            objLoader.load('textures/saru.obj', (mesh) => {
                mesh.scale.set(10, 10, 10);
                mesh.position.copy(position);
                mesh.traverse(child => { if (child instanceof THREE.Mesh) child.castShadow = true; });
                this.scene.add(mesh);

                const prizeShape = new CANNON.Box(new CANNON.Vec3(5, 5, 5)); 
                const prizeBody = new CANNON.Body({
                    mass: 5,
                    position: new CANNON.Vec3(position.x, position.y, position.z),
                    material: this.prizeMaterial
                });
                prizeBody.addShape(prizeShape);
                this.world.addBody(prizeBody);
                this.updateMeshList.push({ mesh: mesh, body: prizeBody });
            });
        });
    }

    private createGoalHole = () => {
        const geo = new THREE.BoxGeometry(30, 50, 30);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const goalMesh = new THREE.Mesh(geo, mat);
        const goalPosition = new THREE.Vector3(-35, -25, 35);
        goalMesh.position.copy(goalPosition);
        this.scene.add(goalMesh);
    }
    
    // --- 景品がスコアされた時の処理 ---
    private handlePrizeScored = (prizeBody: CANNON.Body) => {
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
    }

    private setupEventListeners = () => {
        window.addEventListener("keydown", (e) => this.keys[e.key] = true);
        window.addEventListener("keyup", (e) => this.keys[e.key] = false);
        window.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && this.isOperating) {
                this.isOperating = false;
                this.startArmSequence();
            }
        });
    }

    private startArmSequence = () => {
        const lowerPosition = { y: this.armGroup.position.y - 70 };
        
        new TWEEN.Tween(this.armGroup.position).to(lowerPosition, 2000).easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
                this.grab();
                new TWEEN.Tween(this.armGroup.position).to({ y: this.initialArmPosition.y }, 2000).easing(TWEEN.Easing.Quadratic.In).delay(500)
                    .onComplete(() => {
                        const returnPosition = { x: -35, z: 35 };
                        new TWEEN.Tween(this.armGroup.position).to(returnPosition, 3000).easing(TWEEN.Easing.Sinusoidal.InOut)
                            .onComplete(() => {
                                this.release();
                                new TWEEN.Tween(this.armGroup.position).to(this.initialArmPosition, 2000).easing(TWEEN.Easing.Sinusoidal.InOut)
                                    .onComplete(()=> {
                                        if (this.gameTime > 0) this.isOperating = true;
                                    })
                                    .start();
                            }).start();
                    }).start();
            }).start();
    }
    
    // --- 当たり判定を厳しくした掴む処理 ---
    private grab = () => {
        let closestPrize: { mesh: THREE.Object3D, body: CANNON.Body } | null = null;
        let minDistance = 12; // 判定距離を短くする

        const armWorldPos = new THREE.Vector3();
        this.armGroup.getWorldPosition(armWorldPos);
        
        for (const prize of this.updateMeshList) {
            const prizeWorldPos = new THREE.Vector3().copy(prize.body.position as any);
            const distance = armWorldPos.distanceTo(prizeWorldPos);
            
            // 水平方向の距離もチェックして、より真下にあるものだけを対象にする
            const horizontalDistance = armWorldPos.clone().setY(0).distanceTo(prizeWorldPos.clone().setY(0));

            if (distance < minDistance && horizontalDistance < 8) { // 水平距離の閾値も追加
                minDistance = distance;
                closestPrize = prize;
            }
        }

        if (closestPrize) {
            const constraint = new CANNON.LockConstraint(this.armBodies[0], closestPrize.body);
            this.world.addConstraint(constraint);
            this.grabbedConstraint = constraint;
        }
    }

    private release = () => {
        if (this.grabbedConstraint) {
            this.world.removeConstraint(this.grabbedConstraint);
            this.grabbedConstraint = null;
        }
    }

    private update = () => {
        const deltaTime = 1 / 60;
        this.world.step(deltaTime);
        TWEEN.update();

        // スコア判定：Y座標が一定以下の景品を処理
        const scoredBodies: CANNON.Body[] = [];
        for (const item of this.updateMeshList) {
            item.mesh.position.copy(item.body.position as any);
            item.mesh.quaternion.copy(item.body.quaternion as any);

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
            const armPartMesh = this.armGroup.children[index] as THREE.Mesh;
            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            armPartMesh.getWorldPosition(worldPos);
            armPartMesh.getWorldQuaternion(worldQuat);
            body.position.copy(worldPos as any);
            body.quaternion.copy(worldQuat as any);
        });
    }

    private updateArmMovement = () => {
        if (!this.isOperating) return;

        const speed = 0.5;
        const limitX = 48;
        const limitZ = 48;

        if (this.keys["ArrowUp"] && this.armGroup.position.z > -limitZ) this.armGroup.position.z -= speed;
        if (this.keys["ArrowDown"] && this.armGroup.position.z < limitZ) this.armGroup.position.z += speed;
        if (this.keys["ArrowLeft"] && this.armGroup.position.x > -limitX) this.armGroup.position.x -= speed;
        if (this.keys["ArrowRight"] && this.armGroup.position.x < limitX) this.armGroup.position.x += speed;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const container = new ThreeJSContainer();
    const viewport = container.createRendererDOM(800, 600, new THREE.Vector3(0, 70, 120));
    document.body.appendChild(viewport);
});