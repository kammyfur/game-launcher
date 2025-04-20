const fs = require('fs');
const os = require('os');
const $ = require('jquery');
const { dialog } = require('electron').remote

Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

global.GamesAPI = {
    pause: (pid) => {
        require('child_process').execSync("kill -STOP " + pid);
        if (dialog.showMessageBoxSync({
            type: "error",
            title: "Violation de cadre d'exécution",
            message: "Le jeu en cours d'exécution a rencontré une erreur qui l'a ammené à violer son cadre d'exécution. Game Launcher l'a suspendu afin d'éviter qu'il compromette l'intégrité de votre système. Si vous choisissez de continuer à exécuter le jeu, il pourrait faire planter votre système entier, causant la perte de tout document non enregistré, il est donc recommendé de le fermer maintenant.",
            buttons: [
                "Continuer",
                "Fermer (recommendé)"
            ],
            defaultId: 0,
            cancelId: 0
        })) {
            require('child_process').execSync("kill -KILL " + pid);
            return;
        }
        require('child_process').execSync("kill -CONT " + pid);
    },
    start: (executable, id) => {
        $('#launch').fadeIn(500);
        if (playtime.filter(e => e.id == id).length > 0) {
            global.el = playtime.filter(e => e.id == id)[0];
        } else {
            playtime.push({id: id, time: 0});
            global.el = playtime.filter(e => e.id == id)[0];
        }
        fs.writeFileSync(inc + "/times.json", JSON.stringify(playtime, false, 4));
        odate = new Date();
        setTimeout(() => {
            require('electron').remote.getCurrentWindow().hide();
            GamesAPI.view.close();
            GamesAPI.reload();
            global.GAME_WRAPPER = require('child_process').exec("bash -c \"" + executable + "\"", (error, stdout, stderr) => {
                $('#launch').fadeOut(0);
                ndate = new Date();
                diff = (((ndate - odate)/1000)/60)/60;
                playtime.filter(e => e.id == id)[0].time = playtime.filter(e => e.id == id)[0].time + diff;
                fs.writeFileSync(inc + "/times.json", JSON.stringify(playtime, false, 4));
                delete el;

                if (GAME_WRAPPER.exitCode != 0) {
                    require('electron').remote.getCurrentWindow().show();
                    GamesAPI.crash.open()
                    GamesAPI.crash.process(GAME_WRAPPER.exitCode);
                    if (stdout.split("\n").join("<br>") + "<br>" + stderr.split("\n").join("<br>") == "<br>") {
                        document.getElementById('gamelogs').innerHTML = "aucun journal disponible";
                    } else {
                        document.getElementById('gamelogs').innerHTML = stdout.split("\n").join("<br>") + "<br>" + stderr.split("\n").join("<br>");
                    }
                } else {
                    require('electron').remote.getCurrentWindow().show();
                    return false;
                }
            });
            global.GAME_STDERR_GREATER = 0;
            setInterval(() => {
                try {
                    if (GAME_STDERR_GREATER != GAME_WRAPPER.stderr.bytesRead + GAME_WRAPPER.stderr.bytesWritten) {
                        GamesAPI.pause(GAME_WRAPPER.pid);
                        global.GAME_STDERR_GREATER = GAME_WRAPPER.stderr.bytesRead + GAME_WRAPPER.stderr.bytesWritten;
                    } else {
                        global.GAME_STDERR_GREATER = GAME_WRAPPER.stderr.bytesRead + GAME_WRAPPER.stderr.bytesWritten;
                    }
                } catch (e) {}
            }, 10)
        }, 2000)
    },
    reload: () => {
        document.getElementById('lastplayed').style.display = "";
        document.getElementById('gamelist').style.display = "";
        document.getElementById('removegame').style.display = "";
        document.getElementById('nogames').style.display = "";
        document.getElementById('gamelist').innerHTML = "";
        document.getElementById('removegame').innerHTML = "";

        last = JSON.parse(fs.readFileSync(inc + "/last.json"));
        collection = JSON.parse(fs.readFileSync(inc + "/games.json"));
        playtime = JSON.parse(fs.readFileSync(inc + "/times.json"));

        if (last.id == undefined || last.time == undefined) {
            document.getElementById('lastplayed').style.display = "none";
        } else {
            if (collection.filter(e => e.id == last.id).length > 0) {
                item = collection.filter(e => e.id == last.id)[0];

                odate = new Date(last.time);
                ndate = new Date();
                ydate = new Date(ndate - 86400000);

                if (odate.getDate() + "" + (odate.getMonth() + 1) + "" + odate.getFullYear() == ndate.getDate() + "" + (ndate.getMonth() + 1) + "" + ndate.getFullYear()) {
                    rdate = "aujourd'hui";
                } else if (odate.getDate() - 1 + "" + (odate.getMonth() + 1) + "" + odate.getFullYear() == ydate.getDate() + "" + (ydate.getMonth() + 1) + "" + ydate.getFullYear()) {
                    rdate = "hier";
                } else if (odate.getWeek() == ndate.getWeek()) {
                    rdate = "cette semaine";
                } else if (odate.getWeek() == (ndate.getWeek() - 1)) {
                    rdate = "la semaine dernière";
                } else if (odate.getWeek() == (ndate.getWeek() - 2)) {
                    rdate = "il y a 2 semaines";
                } else if ((odate.getMonth() + 1) + "" + odate.getFullYear() == (ndate.getMonth() + 1) + "" + ndate.getFullYear()) {
                    rdate = "ce mois-ci";
                } else if ((odate.getMonth() + 1) + "" + odate.getFullYear() == (ndate.getMonth()) + "" + ndate.getFullYear()) {
                    rdate = "le mois dernier";
                } else if (odate.getFullYear() == ndate.getFullYear()) {
                    rdate = "cette année";
                } else if (odate.getFullYear() == (ndate.getFullYear() - 1)) {
                    rdate = "l'année dernière";
                } else {
                    rdate = "il y a un certain temps";
                }

                document.getElementById('lastplayed').innerHTML = document.getElementById('lastplayed-default').innerHTML.split("{lastplay_icon}").join(item.icon).split("{lastplay_name}").join(item.name).split("{lastplay_type}").join(item.type).split("{lastplay_time}").join(rdate);
            } else {
                console.error("Invalid last game, it may have been deleted");
            }
        }

        if (collection.length == 0) {
            document.getElementById('gamelist').style.display = "none";
            document.getElementById('nogames').style.display = "block";
        } else {
            document.getElementById('nogames').style.display = "none";
            collection.forEach((game) => {
                document.getElementById('gamelist').innerHTML = document.getElementById('gamelist').innerHTML + `<li class="mdc-list-item" onclick="GamesAPI.view.open(${game.id});"><span class="mdc-list-item__ripple"></span><span class="mdc-list-item__text"><img src="${game.icon}" class="game-list-image"> ${game.name}</span></li>`
                document.getElementById('removegame').innerHTML = document.getElementById('removegame').innerHTML + `<li onclick="GamesAPI.setup.delete(${game.id})" class="mdc-list-item" tabindex="0"><span class="mdc-list-item__ripple"></span><span class="mdc-list-item__text">${game.name}</span></li>`
            });
        }
    },
    continue: () => {
        if (last.id == undefined || last.time == undefined) {
            return false;
        } else {
            if (collection.filter(e => e.id == last.id).length > 0) {
                item = collection.filter(e => e.id == last.id)[0];

                GamesAPI.pushlast(last.id);
                GamesAPI.start(item.command, last.id);
                return true;
            }
        }
    },
    view: {
        open: (id) => {
            if (collection.filter(e => e.id == id).length > 0) {
                item = collection.filter(e => e.id == id)[0];
                global.VIEWED_GAME_ID = id;

                document.getElementById('gameview-name').innerHTML = item.name;
                document.getElementById('gameview-name-2').innerHTML = item.name + "<br><small>" + item.type + "</small>";
                if (playtime.filter(e => e.id == id).length > 0) {
                    hours = playtime.filter(e => e.id == id)[0].time.toString().split(".")[0] - 1 + 1;
                    if (hours == 0) {
                        document.getElementById('gameview-time').innerHTML = "Vous avez joué moins d'une heure";
                    } else if (hours == 1) {
                        document.getElementById('gameview-time').innerHTML = "Vous avez joué 1 heure";
                    } else {
                        document.getElementById('gameview-time').innerHTML = "Vous avez joué " + hours + " heures";
                    }
                } else {
                    document.getElementById('gameview-time').innerHTML = "Vous n'avez pas encore joué à ce jeu";
                }
                document.getElementById('gameview-icon').src = item.icon;

                $("#gameview").fadeIn(200);
                return true;
            } else {
                return false;
            }
        },
        close: () => {
            delete VIEWED_GAME_ID;
            $("#gameview").fadeOut(200);
        },
        play: () => {
            if (VIEWED_GAME_ID == undefined) {
                return false;
            } else {
                if (collection.filter(e => e.id == VIEWED_GAME_ID).length > 0) {
                    item = collection.filter(e => e.id == VIEWED_GAME_ID)[0];

                    GamesAPI.pushlast(VIEWED_GAME_ID);
                    GamesAPI.start(item.command, VIEWED_GAME_ID);
                    return true;
                }
            }
        }
    },
    pushlast: (id) => {
        last.id = id;
        last.time = new Date();
        fs.writeFileSync(inc + "/last.json", JSON.stringify(last, false, 4));
    },
    crash: {
        open: () => {
            $("#crash").fadeIn(200);
        },
        close: () => {
            $("#crash").fadeOut(200);
        },
        process: (exit) => {
            setTimeout(() => {
                switch (exit) {
                    case 1:
                        document.getElementById('crashanalysys').innerHTML = "Erreur générale";
                        break;
                    case 2:
                        document.getElementById('crashanalysys').innerHTML = "Utilisation de shell illégale";
                        break;
                    case 126:
                        document.getElementById('crashanalysys').innerHTML = "Impossible d'exécuter la commande";
                        break;
                    case 127:
                        document.getElementById('crashanalysys').innerHTML = "Impossible de trouver le programme associé à la commande";
                        break;
                    case 128:
                        document.getElementById('crashanalysys').innerHTML = "Argument de sortie incorrect";
                        break;
                    case 130:
                        document.getElementById('crashanalysys').innerHTML = "Programme terminé manuellement";
                        break;
                    default:
                        if (exit > 255) {
                            document.getElementById('crashanalysys').innerHTML = "Erreur interne";
                        } else if (exit > 128 && exit != 130 && exit < 166) {
                            document.getElementById('crashanalysys').innerHTML = "Programme terminé par une erreur fatale";
                        } else if (exit > 63 && exit < 79) {
                            document.getElementById('crashanalysys').innerHTML = "Erreur système";
                        } else {
                            document.getElementById('crashanalysys').innerHTML = "Nous ne parvenons pas à trouver plus d'information sur le plantage";
                        }
                }
            }, 3000)
        }
    },
    setup: {
        open: () => {
            $("#settings").fadeIn(200);
        },
        close: () => {
            $("#settings").fadeOut(200);
        },
        delete: (id) => {
            if (collection.filter(e => e.id == id).length > 0) {
                item = collection.filter(e => e.id == id)[0];

                confi = dialog.showMessageBoxSync({
                    type: "warning",
                    title: "Supprimer le jeu",
                    message: "Voulez-vous vraiment supprimer ce jeu de Game Launcher, il ne sera pas désinstallé du système. Supprimer un jeu de Game Launcher supprime son icône, ainsi que les informations associées (temps de jeu, dernière session, ...).",
                    buttons: [
                        "Supprimer",
                        "Supprimer, mais conserver le temps de jeu",
                        "Ne pas supprimer"
                    ],
                    defaultId: 2,
                    cancelId: 2
                })
                if (confi == 0 || confi == 1) {
                    index = collection.indexOf(collection.filter(e => e.id == id)[0]);
                    if (index > -1) {
                        collection.splice(index, 1);
                    } else {
                        dialog.showMessageBoxSync({
                            type: "error",
                            title: "Erreur",
                            message: "Nous ne parvenons pas à supprimer l'intégralité des données concernant ce jeu, accédez à " + inc + " pour supprimer le reste.",
                            buttons: [
                                "Continuer",
                            ],
                            defaultId: 0,
                            cancelId: 0
                        })
                    }

                    index2 = playtime.indexOf(playtime.filter(e => e.id == id)[0]);
                    if (index2 > -1) {
                        playtime.splice(index2, 1);
                    }

                    if (last.id == id) {
                        fs.writeFileSync(inc + "/last.json", "{}");
                    }
                    fs.writeFileSync(inc + "/games.json", JSON.stringify(collection, false, 4));
                    if (confi == 0) {
                        fs.writeFileSync(inc + "/times.json", JSON.stringify(playtime, false, 4));
                    }

                    GamesAPI.reload()
                }
            }
        },
    },
    new: {
        open: () => {
            $("#newgame").fadeIn(200);
        },
        close: () => {
            $("#newgame").fadeOut(200);
        },
        confirm: () => {
            uid = Math.round(Math.random()*10000000000000000);

            name = document.getElementById('newgame-name').value;
            command = document.getElementById('newgame-command').value;
            type = document.getElementById('newgame-type').value;
            if (fs.existsSync("./icons/" + command.split(" ")[0] + ".svg")) {
                icon = "../icons/" + command.split(" ")[0] + ".svg";
            } else {
                icon = "../icons/default.svg";
            }

            if (type != "no" && icon != "no") {
                collection.push({
                    id: uid,
                    name: name,
                    icon: icon,
                    type: type,
                    command: command
                });
                fs.writeFileSync(inc + "/games.json", JSON.stringify(collection, false, 4));
                GamesAPI.reload();
                GamesAPI.new.close();
                document.getElementById('newgame-name').value = "";
                document.getElementById('newgame-command').value = "";
                document.getElementById('newgame-type').value = "no";
                document.getElementById('newgame-icon').value = "no";
            }
        }
    }
}

if (os.platform() == "win32") {
    inc = os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher\\settings";
} else {
    inc = os.userInfo().homedir + "/.config/game-launcher/settings";
}

window.onload = () => {
    GamesAPI.reload();
    require('electron').remote.getCurrentWindow().show();
}