import {IATurn} from "./ia.js";

const colonnes = document.querySelectorAll(".colonne");
export const carres = document.querySelectorAll(".carre");
const spanScoreJoueur1 = document.querySelector("#score-joueur1");
const spanScoreJoueur2 = document.querySelector("#score-joueur2");
const spanJoueurCourant = document.querySelector("#joueur");
const boutonJouer = document.querySelector("#jouer");
const popup = document.querySelector(".popup-background");
const boutonsRadio = document.querySelectorAll("input[name='mode-jeu']");

let modeDeJeu = "normal";
let joueur = "joueur1";
const couleurJoueur1 = "rouge";
const couleurJoueur2 = "jaune";
let scoreJoueur1 = 0;
let scoreJoueur2 = 0;

export const longueurPlateau = 7;
const longueurGagnante = 4;

function reset() {
	carres.forEach(carre => {
		carre.classList.remove("joueur1");
		carre.classList.remove("joueur2");
		if(carre.firstChild) {
			carre.removeChild(carre.firstChild);
		}
	});
}

function creerJeton(couleur) {
	let jeton = document.createElement("div");
	jeton.classList.add("jeton");
	jeton.classList.add(couleur);
	jeton.classList.add("animated");
	jeton.classList.add("slideInDown");
	return jeton;
}

function ajouterJeton(colonne, jeton) {
	const carres = colonne.children;

	for (let i = longueurPlateau-1; i >= 0; i--) {
		if(!carres[i].firstChild) {
			carres[i].appendChild(jeton);
			carres[i].classList.add(joueur)
			return carres[i];
		}
	}
}

function getIndexLigne(carre) {
	const colonne = carre.parentElement;
	const carresColonne = colonne.children;

	for (let i = 0; i < longueurPlateau; i++) {
		if (carresColonne[i] === carre) {
			return i;
		}
	}
	return null;
}

function getIndexColonne(carre) {
	const colonne = carre.parentElement;

	for (let i = 0; i < longueurPlateau; i++) {
		if (colonnes[i] === colonne) {
			return i;
		}
	}
	return null;
}

function isColonnePleine(colonne) {
	const carres = colonne.children;
	let compteur = 0;
	for (let i = longueurPlateau-1; i >= 0; i--) {
		if(carres[i].firstChild) {
			compteur++;
		}
	}
	return longueurPlateau === compteur;
}

function is4CarresConsecutifs(carres) {
	if(carres.length < 4) {
		return false;
	}

	let compteur = 0;
	let i = 0;

	while(!carres[i].classList.contains(joueur) && i < longueurGagnante) {
		i++;
	}

	for(let j = 0; j < longueurGagnante; j++) {
		let index = i+j;
		if(index < carres.length && carres[index].classList.contains(joueur)) {
			compteur++;
		}
	}

	return compteur === longueurGagnante;
}

function isColonneGagnante(carre) {
	const colonne = carre.parentElement;
	const carresColonne = colonne.children;

	return is4CarresConsecutifs(carresColonne);
}

function isLigneGagnante(carre) {
	const colonnes = carre.parentElement.parentElement.children;
	const indexLigne = getIndexLigne(carre);
	const carresLigne = [];

	for (let i = 0; i < longueurPlateau; i++) {
		let colonne = colonnes[i];
		let carres = colonne.children;
		carresLigne.push(carres[indexLigne]);
	}
	return is4CarresConsecutifs(carresLigne);
}

function isDiagonaleMontanteGagnante(carre) {
	const colonnes = carre.parentElement.parentElement.children;
	const carresDiagonale = [];

	const indexLigne = getIndexLigne(carre);
	const indexColonne = getIndexColonne(carre);
	let indexDepartLigne = 6;
	let indexDepartColonne = 0;

	if (indexLigne + indexColonne < longueurPlateau - 1) {
		indexDepartLigne = indexLigne + indexColonne;
	} else {
		indexDepartColonne = indexColonne + indexLigne - (longueurPlateau - 1);
	}
	
	while(indexDepartLigne >= 0 && indexDepartColonne < longueurPlateau) {
		let colonne = colonnes[indexDepartColonne];
		let carres = colonne.children;
		carresDiagonale.push(carres[indexDepartLigne]);
		indexDepartLigne--;
		indexDepartColonne++;
	}

	return is4CarresConsecutifs(carresDiagonale);
}

function isDiagonaleDescendanteGagnante(carre) {
	const colonnes = carre.parentElement.parentElement.children;
	const carresDiagonale = [];

	const indexLigne = getIndexLigne(carre);
	const indexColonne = getIndexColonne(carre);
	let indexDepartLigne = 0;
	let indexDepartColonne = 0;

	if (indexLigne > indexColonne) {
		indexDepartLigne = indexLigne - indexColonne;
	} else {
		indexDepartColonne = indexColonne - indexLigne;
	}
	
	while(indexDepartLigne < longueurPlateau && indexDepartColonne < longueurPlateau) {
		let colonne = colonnes[indexDepartColonne];
		let carres = colonne.children;
		carresDiagonale.push(carres[indexDepartLigne]);
		indexDepartLigne++;
		indexDepartColonne++;
	}

	return is4CarresConsecutifs(carresDiagonale);
}

function coupGagnant(carre) {
	
	return isColonneGagnante(carre) || isLigneGagnante(carre) || isDiagonaleMontanteGagnante(carre) || isDiagonaleDescendanteGagnante(carre);
}

function partieGagnee() {
	if (joueur === 'joueur1') {
		scoreJoueur1++;
		spanScoreJoueur1.innerHTML = scoreJoueur1;
	} else {
		scoreJoueur2++;
		spanScoreJoueur2.innerHTML = scoreJoueur2;
	}

	alert(`${joueur} a gagné la partie !`);
	reset();
}

function changerJoueur() {
	joueur = joueur === 'joueur1' ? 'joueur2' : 'joueur1';
	spanJoueurCourant.innerHTML = joueur.toUpperCase();		
	spanJoueurCourant.classList.toggle(couleurJoueur1);
	spanJoueurCourant.classList.toggle(couleurJoueur2);
}

function jouer(indexColonne) {
	const colonne = colonnes[indexColonne]
	let jeton = joueur === 'joueur1' ? creerJeton(couleurJoueur1) : creerJeton(couleurJoueur2);
	let carreJoue = ajouterJeton(colonne, jeton);
	if(coupGagnant(carreJoue)) {
		partieGagnee();
	}
	changerJoueur();
}

function canPlay() {
	return joueur === monNomDeJoueur && nombreDeJoueurs === 2;
}

colonnes.forEach(colonne => {
	colonne.addEventListener('click', (event) => {
		if (isColonnePleine(colonne)) {
			return;
		}
		const indexColonne = colonne.dataset.index;
		jouer(indexColonne);
		if (modeDeJeu === "ordinateur") {
			const indexColonneIA = IATurn(carres);
			jouer(indexColonneIA);
		}
	});
});

boutonsRadio.forEach(boutonRadio => {
	boutonRadio.addEventListener('click', (event) => {
		modeDeJeu = event.target.value;
	});
});

boutonJouer.addEventListener('click', (event) => {
	popup.classList.toggle('hide');
});