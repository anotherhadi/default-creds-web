{
  description = "default-creds-web: Web frontend for the default-creds credentials database";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    bun2nix = {
      url = "github:nix-community/bun2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    bun2nix,
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};

    bun2nixPkg = bun2nix.packages.${system}.default;

    default-creds-web = pkgs.stdenv.mkDerivation (finalAttrs: {
      pname = "default-creds-web";
      version = "1.0.0";

      src = ./.;

      nativeBuildInputs = [
        pkgs.bun
        bun2nixPkg.hook
      ];

      bunDeps = bun2nixPkg.fetchBunDeps {
        bunNix = ./bun.nix;
      };

      buildPhase = ''
        runHook preBuild
        bun run build
        runHook postBuild
      '';

      installPhase = ''
                runHook preInstall

                mkdir -p $out/share/default-creds-web

                cp -r dist         $out/share/default-creds-web/dist
                cp    package.json $out/share/default-creds-web/package.json
                cp -r node_modules $out/share/default-creds-web/node_modules

                mkdir -p $out/bin
                cat > $out/bin/default-creds-web << EOF
        #!/bin/sh
        export HOST="\''${HOST:-127.0.0.1}"
        export PORT="\''${PORT:-4321}"
        export PATH="${pkgs.git}/bin:\$PATH"
        exec ${pkgs.nodejs}/bin/node $out/share/default-creds-web/dist/server/entry.mjs
        EOF
                chmod +x $out/bin/default-creds-web

                runHook postInstall
      '';

      meta = {
        description = "Web frontend for the default-creds credentials database";
        homepage = "https://github.com/anotherhadi/default-creds-web";
        license = pkgs.lib.licenses.mit;
        mainProgram = "default-creds-web";
      };
    });
  in {
    packages.${system} = {
      inherit default-creds-web;
      default = default-creds-web;
    };

    devShells.${system}.default = pkgs.mkShell {
      packages = [
        pkgs.bun
        bun2nixPkg
      ];
    };

    nixosModules.default = {
      config,
      lib,
      ...
    }: let
      cfg = config.services.default-creds-web;
    in {
      options.services.default-creds-web = {
        enable = lib.mkEnableOption "default-creds-web credential search service";

        port = lib.mkOption {
          type = lib.types.port;
          default = 4321;
          description = "TCP port the service will listen on.";
        };

        dataRepoUrl = lib.mkOption {
          type = lib.types.str;
          default = "https://github.com/anotherhadi/default-creds.git";
          description = "Git URL of the default-creds data repository to clone/pull.";
        };

        dataSyncIntervalHours = lib.mkOption {
          type = lib.types.int;
          default = 6;
          description = "How often (in hours) to re-pull the data repository.";
        };
      };

      config = lib.mkIf cfg.enable {
        systemd.services.default-creds-web = {
          description = "default-creds-web – default credentials database";
          wantedBy = ["multi-user.target"];
          after = ["network.target"];

          environment = {
            HOST = "127.0.0.1";
            PORT = toString cfg.port;
            DATA_REPO_URL = cfg.dataRepoUrl;
            DATA_SYNC_INTERVAL_HOURS = toString cfg.dataSyncIntervalHours;
            DATA_REPO_DIR = "/var/lib/default-creds-web/data-repo";
          };

          serviceConfig = {
            ExecStart = "${self.packages.${system}.default}/bin/default-creds-web";
            WorkingDirectory = "${self.packages.${system}.default}/share/default-creds-web";
            Restart = "on-failure";
            RestartSec = "5s";

            DynamicUser = true;
            StateDirectory = "default-creds-web";

            NoNewPrivileges = true;
            PrivateTmp = true;
            ProtectSystem = "strict";
            ProtectHome = true;
            CapabilityBoundingSet = "";
            AmbientCapabilities = "";
            LockPersonality = true;
            MemoryDenyWriteExecute = false;
            RestrictNamespaces = true;
            RestrictRealtime = true;
          };
        };
      };
    };

    nixosModules.default-creds-web = self.nixosModules.default;
  };
}
