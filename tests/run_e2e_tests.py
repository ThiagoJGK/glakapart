import os
import sys
import time
import socket
import shutil
import subprocess
import re
import json
import urllib.request
import urllib.error

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PARENT_DIR = os.path.dirname(PROJECT_ROOT)
DEV_PORT = 3000
PROD_PORT = 3001

LEGACY_FOLDERS = [
    "glak-apart",
    "glak-apart BACK UP ANTES DE NEXT",
    "Glak Apart Web"
]

PRESERVED_FOLDERS = [
    "Back UP GLAK APART WORDPRESS",
    "Instagram",
    "Nuevo Glak Apart"
]

class E2ETestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.tests_run = 0

    def log_section(self, name):
        print("\n" + "="*60)
        print(f"  {name}")
        print("="*60)

    def assert_true(self, condition, message):
        self.tests_run += 1
        if condition:
            self.passed += 1
            print(f"[PASS] {message}")
        else:
            self.failed += 1
            print(f"[FAIL] {message}")

    def run_cmd(self, args, timeout=60, check=True):
        """Runs shell commands securely on Windows."""
        try:
            res = subprocess.run(
                args,
                cwd=PROJECT_ROOT,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                shell=True,
                timeout=timeout
            )
            return res
        except subprocess.TimeoutExpired as e:
            if check:
                raise e
            return None

    def is_port_in_use(self, port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) == 0

    def wait_for_port(self, port, timeout=30):
        start_time = time.time()
        while time.time() - start_time < timeout:
            if self.is_port_in_use(port):
                return True
            time.sleep(1)
        return False

    def test_tier_1_feature_coverage(self):
        self.log_section("Tier 1: Feature Coverage (Static & Existence Checks)")

        # 1. next.config.ts / next.config.js check
        config_paths = ["next.config.ts", "next.config.js"]
        config_found = False
        config_has_standalone = False
        for path in config_paths:
            full_path = os.path.join(PROJECT_ROOT, path)
            if os.path.exists(full_path):
                config_found = True
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Check for output: 'standalone' or output: "standalone"
                    match = re.search(r"output\s*:\s*['\"]standalone['\"]", content)
                    if match:
                        config_has_standalone = True
                break
        self.assert_true(config_found, "next.config.ts or next.config.js exists")
        self.assert_true(config_has_standalone, "next.config contains output: 'standalone'")

        # 2. Dockerfile existence
        dockerfile_path = os.path.join(PROJECT_ROOT, "Dockerfile")
        self.assert_true(os.path.exists(dockerfile_path), "Dockerfile exists")

        # 3. .dockerignore existence
        dockerignore_path = os.path.join(PROJECT_ROOT, ".dockerignore")
        self.assert_true(os.path.exists(dockerignore_path), ".dockerignore exists")

        # 4. docker-compose.yml existence
        compose_dev_path = os.path.join(PROJECT_ROOT, "docker-compose.yml")
        self.assert_true(os.path.exists(compose_dev_path), "docker-compose.yml exists")

        # 5. docker-compose.prod.yml existence
        compose_prod_path = os.path.join(PROJECT_ROOT, "docker-compose.prod.yml")
        self.assert_true(os.path.exists(compose_prod_path), "docker-compose.prod.yml exists")

        # 6. package.json scripts check
        pkg_json_path = os.path.join(PROJECT_ROOT, "package.json")
        has_pkg_json = os.path.exists(pkg_json_path)
        self.assert_true(has_pkg_json, "package.json exists")
        
        has_docker_dev = False
        has_docker_prod = False
        has_docker_down = False
        has_cleanup = False
        
        if has_pkg_json:
            try:
                with open(pkg_json_path, 'r', encoding='utf-8') as f:
                    pkg_data = json.load(f)
                    scripts = pkg_data.get("scripts", {})
                    has_docker_dev = "docker:dev" in scripts
                    has_docker_prod = "docker:prod" in scripts
                    has_docker_down = "docker:down" in scripts
                    has_cleanup = "cleanup" in scripts
            except Exception as e:
                print(f"[ERROR] Failed to parse package.json: {e}")

        self.assert_true(has_docker_dev, "package.json scripts contain 'docker:dev'")
        self.assert_true(has_docker_prod, "package.json scripts contain 'docker:prod'")
        self.assert_true(has_docker_down, "package.json scripts contain 'docker:down'")
        self.assert_true(has_cleanup, "package.json scripts contain 'cleanup'")

    def test_tier_2_boundary_cases(self):
        self.log_section("Tier 2: Boundary & Corner Cases")

        # 1. Docker daemon availability
        res = self.run_cmd("docker info", check=False)
        if res is None or res.returncode != 0:
            print("[INFO] Docker daemon is not running. Attempting to start Docker Desktop...")
            docker_path = "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"
            if os.path.exists(docker_path):
                try:
                    subprocess.Popen([docker_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    print("[INFO] Launched Docker Desktop. Waiting for daemon to become ready (up to 60s)...")
                    for _ in range(60):
                        time.sleep(1)
                        check_res = self.run_cmd("docker info", check=False)
                        if check_res is not None and check_res.returncode == 0:
                            print("[INFO] Docker daemon is now running and responsive.")
                            res = check_res
                            break
                except Exception as e:
                    print(f"[ERROR] Failed to start Docker Desktop programmatically: {e}")
            else:
                print(f"[WARN] Docker Desktop not found at default path: {docker_path}")
        
        self.assert_true(res is not None and res.returncode == 0, "Docker daemon is running and responsive")

        # 2. Port conflict checks
        dev_port_free = not self.is_port_in_use(DEV_PORT)
        prod_port_free = not self.is_port_in_use(PROD_PORT)
        self.assert_true(dev_port_free, f"Port {DEV_PORT} (dev) is free")
        self.assert_true(prod_port_free, f"Port {PROD_PORT} (prod) is free")

        # 3. Cleanup idempotency & preservation
        # Prepare mock legacy and preserved directories in the parent directory
        created_legacy = []
        created_preserved = []
        
        print(f"Parent directory: {PARENT_DIR}")
        for folder in LEGACY_FOLDERS:
            folder_path = os.path.join(PARENT_DIR, folder)
            if not os.path.exists(folder_path):
                try:
                    os.makedirs(folder_path, exist_ok=True)
                    with open(os.path.join(folder_path, "mock_legacy.txt"), "w", encoding="utf-8") as f:
                        f.write("mock legacy file")
                    created_legacy.append(folder_path)
                except Exception as e:
                    print(f"[ERROR] Could not create mock legacy folder {folder_path}: {e}")
            else:
                print(f"[INFO] Legacy folder already exists: {folder_path}")

        for folder in PRESERVED_FOLDERS:
            folder_path = os.path.join(PARENT_DIR, folder)
            if not os.path.exists(folder_path):
                try:
                    os.makedirs(folder_path, exist_ok=True)
                    with open(os.path.join(folder_path, "mock_preserved.txt"), "w", encoding="utf-8") as f:
                        f.write("mock preserved file")
                    created_preserved.append(folder_path)
                except Exception as e:
                    print(f"[ERROR] Could not create mock preserved folder {folder_path}: {e}")
            else:
                print(f"[INFO] Preserved folder already exists: {folder_path}")

        # Check if cleanup script exists in package.json
        pkg_json_path = os.path.join(PROJECT_ROOT, "package.json")
        cleanup_script_exists = False
        if os.path.exists(pkg_json_path):
            try:
                with open(pkg_json_path, 'r', encoding='utf-8') as f:
                    pkg_data = json.load(f)
                    cleanup_script_exists = "cleanup" in pkg_data.get("scripts", {})
            except Exception:
                pass

        if not cleanup_script_exists:
            print("[WARN] No 'cleanup' script found in package.json. Attempting run anyway...")
        
        print("Running cleanup script command...")
        cleanup_res = self.run_cmd("npm run cleanup", check=False)
        if cleanup_res:
            print(f"Cleanup stdout: {cleanup_res.stdout.strip()}")
            print(f"Cleanup stderr: {cleanup_res.stderr.strip()}")
            self.assert_true(cleanup_res.returncode == 0, "Cleanup command executed with code 0")
        else:
            self.assert_true(False, "Cleanup command failed to execute")

        # Verify legacy folders are deleted
        for folder in LEGACY_FOLDERS:
            folder_path = os.path.join(PARENT_DIR, folder)
            deleted = not os.path.exists(folder_path)
            self.assert_true(deleted, f"Legacy folder '{folder}' was deleted")
            if not deleted:
                # Force delete so we don't leave mess
                shutil.rmtree(folder_path, ignore_errors=True)

        # Verify preserved folders are intact
        for folder in PRESERVED_FOLDERS:
            folder_path = os.path.join(PARENT_DIR, folder)
            intact = os.path.exists(folder_path)
            self.assert_true(intact, f"Preserved folder '{folder}' remains intact")

        # Clean up mock preserved folders that we created
        for folder_path in created_preserved:
            if os.path.exists(folder_path):
                shutil.rmtree(folder_path, ignore_errors=True)

    def test_tier_3_cross_feature_combinations(self):
        self.log_section("Tier 3: Cross-Feature Combinations")

        # Ensure ports are free first
        if self.is_port_in_use(DEV_PORT) or self.is_port_in_use(PROD_PORT):
            print("[WARN] Port 3000 or 3001 is already in use. Tearing down first...")
            self.run_cmd("npm run docker:down", check=False)
            time.sleep(2)

        self.assert_true(not self.is_port_in_use(DEV_PORT), f"Port {DEV_PORT} (dev) is free before starting")
        self.assert_true(not self.is_port_in_use(PROD_PORT), f"Port {PROD_PORT} (prod) is free before starting")

        # Parse package.json to see if scripts exist
        pkg_json_path = os.path.join(PROJECT_ROOT, "package.json")
        has_dev_script = False
        has_prod_script = False
        if os.path.exists(pkg_json_path):
            try:
                with open(pkg_json_path, 'r', encoding='utf-8') as f:
                    scripts = json.load(f).get("scripts", {})
                    has_dev_script = "docker:dev" in scripts
                    has_prod_script = "docker:prod" in scripts
            except Exception:
                pass

        if not (has_dev_script and has_prod_script):
            self.assert_true(False, "Missing docker:dev or docker:prod scripts in package.json, skipping parallel start")
            return

        print("Starting dev container (npm run docker:dev) in background...")
        dev_proc = subprocess.Popen("npm run docker:dev", cwd=PROJECT_ROOT, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        prod_proc = None
        try:
            dev_started = self.wait_for_port(DEV_PORT, timeout=30)
            self.assert_true(dev_started, f"Dev container started and bound port {DEV_PORT}")

            print("Starting prod container (npm run docker:prod) in background...")
            prod_proc = subprocess.Popen("npm run docker:prod", cwd=PROJECT_ROOT, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            prod_started = self.wait_for_port(PROD_PORT, timeout=45)
            self.assert_true(prod_started, f"Prod container started and bound port {PROD_PORT}")

            coexist = self.is_port_in_use(DEV_PORT) and self.is_port_in_use(PROD_PORT)
            self.assert_true(coexist, f"Dev (port {DEV_PORT}) and Prod (port {PROD_PORT}) are running in parallel")
        
        finally:
            print("Stopping all containers via npm run docker:down...")
            down_res = self.run_cmd("npm run docker:down", check=False)
            if down_res:
                print(f"docker:down status: {down_res.returncode}")
            
            if dev_proc:
                dev_proc.terminate()
            if prod_proc:
                prod_proc.terminate()
            
            # Wait for ports to be released
            time.sleep(2)
            self.assert_true(not self.is_port_in_use(DEV_PORT), f"Port {DEV_PORT} released after tear-down")
            self.assert_true(not self.is_port_in_use(PROD_PORT), f"Port {PROD_PORT} released after tear-down")

    def test_tier_4_real_world_workload(self):
        self.log_section("Tier 4: Real-World Workload Simulation")

        pkg_json_path = os.path.join(PROJECT_ROOT, "package.json")
        has_dev_script = False
        has_prod_script = False
        if os.path.exists(pkg_json_path):
            try:
                with open(pkg_json_path, 'r', encoding='utf-8') as f:
                    scripts = json.load(f).get("scripts", {})
                    has_dev_script = "docker:dev" in scripts
                    has_prod_script = "docker:prod" in scripts
            except Exception:
                pass

        if not (has_dev_script and has_prod_script):
            self.assert_true(False, "Missing docker:dev or docker:prod scripts in package.json, skipping integration workload")
            return

        # ----------------------------------------------------
        # 1. Dev Server & Hot-Reload Verification
        # ----------------------------------------------------
        print("Starting dev container (npm run docker:dev) in background for integration verification...")
        dev_proc = subprocess.Popen("npm run docker:dev", cwd=PROJECT_ROOT, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        target_page_file = os.path.join(PROJECT_ROOT, "src", "app", "(public)", "page.tsx")
        original_content = None
        
        try:
            if not self.wait_for_port(DEV_PORT, timeout=30):
                self.assert_true(False, f"Dev port {DEV_PORT} did not become active")
                return

            # Check HTTP response
            url_dev = f"http://localhost:{DEV_PORT}/"
            try:
                req = urllib.request.Request(url_dev, headers={'User-Agent': 'E2E-Test-Runner'})
                with urllib.request.urlopen(req, timeout=10) as response:
                    status = response.getcode()
                    html = response.read().decode('utf-8')
                    self.assert_true(status == 200, "Dev server GET http://localhost:3000/ returns 200")
                    self.assert_true("Glak" in html or "html" in html, "Dev server returns site HTML content")
            except Exception as e:
                self.assert_true(False, f"Failed to perform HTTP GET to dev server: {e}")

            # Verify Hot-Reload
            if os.path.exists(target_page_file):
                print(f"Modifying {target_page_file} to simulate hot-reload...")
                with open(target_page_file, 'r', encoding='utf-8') as f:
                    original_content = f.read()

                # Replace standard HomePage return
                target_str = "return <Home />;"
                replacement_str = "return (\n        <>\n            <div id=\"e2e-hotreload-marker\" style={{display: 'none'}}>E2E-TEST-HOTRELOAD-MARKER</div>\n            <Home />\n        </>\n    );"
                
                if target_str in original_content:
                    modified_content = original_content.replace(target_str, replacement_str)
                    with open(target_page_file, 'w', encoding='utf-8') as f:
                        f.write(modified_content)

                    # Wait for compilation/hot-reload and verify
                    print("Waiting for hot-reload propagation...")
                    reload_success = False
                    start_reload = time.time()
                    while time.time() - start_reload < 20: # 20 seconds compilation timeout
                        try:
                            req = urllib.request.Request(url_dev, headers={'User-Agent': 'E2E-Test-Runner'})
                            with urllib.request.urlopen(req, timeout=5) as response:
                                html = response.read().decode('utf-8')
                                if "E2E-TEST-HOTRELOAD-MARKER" in html:
                                    reload_success = True
                                    break
                        except Exception:
                            pass
                        time.sleep(2)
                    
                    self.assert_true(reload_success, "Hot-reload propagated successfully to dev container output")
                else:
                    self.assert_true(False, f"Could not find exact string '{target_str}' in page.tsx for hot-reload modification")
            else:
                self.assert_true(False, f"page.tsx file not found at {target_page_file}")

        finally:
            # Revert hot-reload changes
            if original_content is not None and os.path.exists(target_page_file):
                with open(target_page_file, 'w', encoding='utf-8') as f:
                    f.write(original_content)
                print("Restored original page.tsx content.")
            
            print("Stopping dev container...")
            if dev_proc:
                dev_proc.terminate()
            self.run_cmd("npm run docker:down", check=False)
            time.sleep(2)

        # ----------------------------------------------------
        # 2. Prod Server & Isolation Verification
        # ----------------------------------------------------
        print("Starting prod container (npm run docker:prod) in background for integration verification...")
        prod_proc = subprocess.Popen("npm run docker:prod", cwd=PROJECT_ROOT, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        try:
            if not self.wait_for_port(PROD_PORT, timeout=45):
                self.assert_true(False, f"Prod port {PROD_PORT} did not become active")
                return

            # Check HTTP response
            url_prod = f"http://localhost:{PROD_PORT}/"
            try:
                req = urllib.request.Request(url_prod, headers={'User-Agent': 'E2E-Test-Runner'})
                with urllib.request.urlopen(req, timeout=10) as response:
                    status = response.getcode()
                    html = response.read().decode('utf-8')
                    self.assert_true(status == 200, "Prod server GET http://localhost:3001/ returns 200")
            except Exception as e:
                self.assert_true(False, f"Failed to perform HTTP GET to prod server: {e}")

            # Verify Hot-Reload Isolation
            if os.path.exists(target_page_file) and original_content is not None:
                print(f"Modifying {target_page_file} to verify prod isolation...")
                target_str = "return <Home />;"
                replacement_str = "return (\n        <>\n            <div id=\"e2e-hotreload-marker\" style={{display: 'none'}}>E2E-TEST-HOTRELOAD-MARKER</div>\n            <Home />\n        </>\n    );"
                
                modified_content = original_content.replace(target_str, replacement_str)
                with open(target_page_file, 'w', encoding='utf-8') as f:
                    f.write(modified_content)

                # Wait and verify it is NOT propagated
                print("Waiting to check isolation (should NOT propagate)...")
                time.sleep(5)
                
                isolated = False
                try:
                    req = urllib.request.Request(url_prod, headers={'User-Agent': 'E2E-Test-Runner'})
                    with urllib.request.urlopen(req, timeout=5) as response:
                        html = response.read().decode('utf-8')
                        if "E2E-TEST-HOTRELOAD-MARKER" not in html:
                            isolated = True
                except Exception as e:
                    print(f"[WARN] Error fetching prod page: {e}")
                
                self.assert_true(isolated, "Prod container is isolated from hot-reload code changes on host")
            else:
                self.assert_true(False, "Skipped isolation check due to missing page.tsx or original content")

        finally:
            # Revert isolation changes
            if original_content is not None and os.path.exists(target_page_file):
                with open(target_page_file, 'w', encoding='utf-8') as f:
                    f.write(original_content)
                print("Restored original page.tsx content.")
            
            print("Stopping prod container...")
            if prod_proc:
                prod_proc.terminate()
            self.run_cmd("npm run docker:down", check=False)

    def run_all_tests(self):
        print("="*60)
        print("  GLAK APART NEXT.JS DOCKER & CLEANUP E2E TEST SUITE  ")
        print("="*60)
        
        try:
            self.test_tier_1_feature_coverage()
            self.test_tier_2_boundary_cases()
            self.test_tier_3_cross_feature_combinations()
            self.test_tier_4_real_world_workload()
        except KeyboardInterrupt:
            print("\nTests interrupted by user.")
        finally:
            print("\nEnsuring all Docker containers are cleaned up...")
            self.run_cmd("npm run docker:down", check=False)

        self.log_section("TEST SUMMARY")
        print(f"Total Tests Run: {self.tests_run}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        
        if self.failed > 0:
            print("\nResult: FAIL [X]")
            sys.exit(1)
        else:
            print("\nResult: PASS [OK]")
            sys.exit(0)

if __name__ == "__main__":
    runner = E2ETestRunner()
    runner.run_all_tests()
