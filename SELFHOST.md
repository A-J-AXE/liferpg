# One personal LifeOS server on the DGX Spark

The root Compose stack builds the planner and the pinned openGym fork from this branch. The planner owns the `planner` volume. openGym's API exclusively owns the workout data in the `gym` volume. The planner does not modify openGym's profile files. This is a single-owner setup. Anyone with the planner password shares that one LifeOS workspace.

## Bring up the stack

On the Spark, install Docker Engine with the Compose plugin. Join the Spark, PC and iPhone to your private network. For a Tailscale deployment, enable HTTPS for the tailnet, then use the Spark's real fully qualified tailnet name. The same HTTPS hostname must stay stable for passkeys.

```sh
git clone --branch feat/lifeos https://github.com/A-J-AXE/liferpg.git
cd liferpg
# Substitute the Spark's real HTTPS hostname here. Use no path or port.
hostname_for_gym='spark.YOUR-TAILNET.ts.net'
umask 077
printf 'GYM_HOST=%s\nPUBLIC_ORIGIN=https://%s\nPLANNER_PASSWORD=%s\n' \
  "$hostname_for_gym" "$hostname_for_gym" "$(openssl rand -hex 24)" > .env
docker compose config --quiet
docker compose up --build -d
tailscale serve --bg http://127.0.0.1:8080
docker compose ps
```

Create the environment file only during initial setup. Keep its planner password and hostname for subsequent restarts. The gateway binds only to loopback on the Spark. Tailscale Serve publishes HTTPS to permitted tailnet devices. Limit access through your tailnet policy. Only the gateway needs a host port. If you already use port 8080 or Tailscale Serve, choose a free loopback port and matching Serve route.

## PC and iPhone

1. Open `https://YOUR-HOST/` in the PC browser. Sign in as `owner` with the planner password from the Spark's .env. Use the same address in iPhone Safari. Add it to the Home Screen if desired. A new project, its uploaded image, tasks, diary and skill receipts are saved in the shared planner volume.
2. In LifeOS choose **openGym → Open standalone openGym**. The full app also lives at `https://YOUR-HOST/gym/`. Register or sign in to the owner's openGym profile here. Planner credentials and openGym credentials are independent. Use one openGym profile for this personal workspace.
3. On the signed-in openGym website, choose **Settings → Account → Pair the mobile app** and confirm your identity. On the iPhone screen shown in the chat, choose **Connect to my server**. Enter **https://YOUR-HOST** and the freshly generated pairing code. The gateway routes the native app's /api requests directly to openGym. The code expires after five minutes.
4. Log and save a workout in the native app. On the PC, while signed in to the same openGym account, open LifeOS Overview. It checks openGym periodically while visible and credits saved workout IDs once. The account’s workout history remains in openGym. Sessions saved offline on the phone can appear only after openGym syncs them.
5. To use the Electron window against the Spark, set `LIFEOS_SERVER_URL` to the HTTPS origin and `LIFEOS_OWNER_PASSWORD` in the launching process environment, then run `npm run desktop` in the local checkout. The browser version works without either desktop variable.

The planner saves edits locally, sends them with a revision number, and checks for changes from the other device. If two devices edit the same server revision, the later write is refused. Export that device's edits before selecting **Use server version** and reapplying them. The export is a JSON recovery copy. An already-open page can retain unsent edits during a network interruption; opening LifeOS cold offline is not supported.

## MCP over your existing SSH connection

For planner reads, enable AI planner access in LifeOS Settings. Use an MCP client's stdio transport. For example, if the Spark SSH alias is `spark` and the checkout is `/srv/liferpg`, configure the client to start:

```sh
ssh -T spark 'cd /srv/liferpg && docker compose exec -T planner node mcp.mjs'
```

For the native openGym tools, build the optional service, then run it as a stdio process:

```sh
docker compose --profile tools build gym-mcp
ssh -T spark 'cd /srv/liferpg && docker compose run --rm -T --no-deps gym-mcp'
```

The openGym MCP container mounts the gym data read-only and has no network. On multiple-profile instances, explicitly specify the owner's OPENGYM_UID. The pinned upstream has an optional paired workout-write tool; this deployment does not enable it. Neither MCP process exposes an internet endpoint.

## Backup, restore and verify

Stop writers with `docker compose stop`. Back up both named volumes plus .env to private storage. With the default project name:

```sh
mkdir -p backups
for volume in planner gym; do
  docker run --rm -v "liferpg_${volume}:/source:ro" -v "$PWD/backups:/backup" alpine \
    sh -c "cd /source && tar czf /backup/${volume}.tgz ."
done
docker compose start
```

Restore into a fresh, empty Compose deployment with the same hostname and environment. Use `docker compose create` to create volumes. For each volume, mount it writable at /target and unpack the corresponding archive with `tar xzf /backup/planner.tgz -C /target` (use gym.tgz for gym). Start services and check one known task, project image, workout and skill receipt. Keep the archives private because the gym archive includes account and session data. To update, preserve volumes, review upstream notices, rebuild, and repeat that check.

## Verification boundary

Testing on the development PC covers local Electron, real native workout save and history, and two independent clients sharing planner state. Building containers on the Spark, its TLS routing, a physical iPhone pairing, and a disaster-recovery restore require the owner's server. The exercise media remains inside the non-commercial openGym fork with its original notice.

References: [openGym self-hosting and phone pairing](https://opengym.ch/docs.html#selfhost), [pinned MCP README](fitness/mcp/README.md), [Tailscale Serve](https://tailscale.com/docs/features/tailscale-serve).

