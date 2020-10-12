import {longueurPlateau} from './script.js';

export function IATurn(carres) {
	let max_depth = 3;
	let params = [0,5,25,1000]
	//game_array : 2d array, 0 = empty, 1 = Joueur 1, 2 = Joueur 2
	let gameState = [];
	for(let n = 0; n < longueurPlateau; n++){
		gameState.push([]);
	}
	for(let [i,carre] of carres.entries()){
		let n;
		if(carre.classList.contains("joueur1")){
			n = 1;
		}	
		else if(carre.classList.contains("joueur2")){
			n = 2;
		}
		else{
			n = 0;
		}
		gameState[Math.floor(i/longueurPlateau)][i % longueurPlateau] = n;
	}
	let stateValues = {};
	for(let i = 0; i < longueurPlateau; i++){
		let newState = nextState(gameState,i,2);
		if(newState != null){
			stateValues[i] = minimax(newState,2,1,max_depth,params)
		}
	}
	return argMax(stateValues);
}

function argMax(obj) {
	let k_max = 0;
	let v_max = -Infinity;
	for(let k in obj){
		if(obj[k] > obj[k_max]){
			k_max = k;
			v_max = obj[k];
		}
	}
  return k_max;
}

//Algorithme minimax, renvoie la colonne dans laquelle jouer la plus favorable pour l'IA à partir de l'état actuel
function minimax(state,player,currentPlayer,depth,params){
	currentPlayer = currentPlayer || player;
	params = params || [0,1,10,50]
	//Condition d'arrêt
	if(depth == 0 || isGagnant(state)) {
		return heuristic(state,player,params);
	}
	//Cas classique
	let nextStates = getNextStates(state,currentPlayer);
	let minimaxValues = nextStates.map(newState => minimax(newState,player,nextPlayer(currentPlayer),depth - 1,params));
	// player turn
	if(player == currentPlayer){
		return Math.max(...minimaxValues);
	}
	// opponent turn
	if(player == nextPlayer(currentPlayer)){
		return Math.min(...minimaxValues);
	}
}

function sum(array){
	let reducer = (acc,val) => acc + val;
	return array.reduce(reducer);
}

// Renvoie le prochain état du jeu à partir de l'état actuel, du joueur et de la colonne choisie
function nextState(state,col,player) {
	let newState = state.map(col => col.slice())
	//Cas impossibles
	if(col < 0 || col >= longueurPlateau){
		return null;
	}
	if(newState[col][0] != 0){
		return null;
	}
	for (let i = longueurPlateau-1; i >= 0; i--) {
		if(newState[col][i] == 0) {
			newState[col][i] = player;
			return newState;
		}
	}
}

function getNextStates(state,player) {
	return state.map((col,i) => nextState(state,i,player)).filter(arr => arr != null);
}

function nextPlayer(player) {
	return (player == 1)?2:1;
}

// Renvoie la valeur de l'état pour le joueur donné. (1 si état gagnant, -1 si état perdant)
function heuristic(state,player,params) {
	let gagnant = isGagnant(state);
	if(gagnant == player){
		return Infinity;
	}
	if(gagnant == nextPlayer(player)){
		return -Infinity;
	}
	let sum = 0;
	let lines = getLines(state);
	for(let line of lines){
		for(let i = 0; i < line.length - 3; i++){
			let seq = line.slice(i,i+4);
			let n1 = count(seq,1);
			let n2 = count(seq,2);
			if(n1 && !n2){
				let p = params[n1];
				sum = (player == 1)?(sum + p):(sum - p);
			}
			else if(n2 && !n1){
				let p = params[n2];
				sum = (player == 2)?(sum + p):(sum - p);
			}
		}
	}
	return sum;
}
function count(arr,n){
	return arr.filter(x => x == n).length;
}
//Renvoie la liste des lignes, colonnes et diagonales de l'état actuel du jeu
function getLines(state){
	//On transpose le state
	let state_t = state.map((col,i) => state.map(row => row[i]));
	let state_r = state.slice().reverse();
	//On récupère les diagonales
	let diag_m = []
	let diag_d = []
	for(let n = 0; n < 2 * longueurPlateau - 1; n++){
		diag_m.push([]);
		diag_d.push([]);
	}
	for(let i = 0; i < longueurPlateau; i++){
		for(let j = 0; j < longueurPlateau; j++){
			diag_m[i + j].push(state[i][j]);
			diag_d[i + j].push(state_r[i][j]);
		}
	}
	//On supprime les diagonales de moins de 4 cases
	diag_m = diag_m.filter(diag => diag.length >= 4);
	diag_d = diag_d.filter(diag => diag.length >= 4);
	//On teste toutes les lignes obtenues
	return state.concat(state_t).concat(diag_m).concat(diag_d);
}
// Renvoie 0 si le jeu n'est pas gagnant, 1 si il l'est pour le joueur 1, 2 pour le joueur 2
function isGagnant(state) {
	let lines = getLines(state);
	for(let line of lines){
		for(let i = 0; i < line.length - 3; i++){
			let seq = line.slice(i,i+4);
			if(seq.every(s => s == 1))
				return 1;
			if(seq.every(s => s == 2))
				return 2;
		}
	}
	return 0;
}