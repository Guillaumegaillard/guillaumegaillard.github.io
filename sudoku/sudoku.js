var app = angular.module('myApp', ['file']);
// allow save file
app.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}]);

// https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

app.controller('myCtrl', function($scope) {
	// angular.element(document.getElementById('bob')).scope().grids_to_string();

	// encode a sudoku in base 64 
	const alphabet="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
	var intRegex = '^[123456789].*'; 

	$scope.version_Sudoku_Gui = "1.1";

	$scope.sudoku_id=0;
	$scope.grids = grids;

	// check for dup. grids
	var grids_unique=new Set();
	for (var grid=0; grid<grids.length; grid++){
		grids_unique.add(grids[grid]["scode"].substring(0,5*9));
	};
	console.log(grids_unique.size, grids.length);

	// user variables inits
	$scope.cell_helper = false;
	$scope.super_cell_helper = false;
	$scope.digit_helper = true;
	$scope.bold_digit = 0;
	$scope.final_check = false;
	$scope.local_check = true;
	$scope.shown_sol_tab = false;
	$scope.hypothesis = false;

	$scope.wun = false;

	// init grids
	$scope.matrix_grid_start = [
		[0,0,0,0,2,0,0,0,0],
		[9,0,0,1,8,0,0,0,4],
		[3,0,0,0,6,9,8,0,0],
		[0,9,0,0,0,0,0,0,2],
		[0,6,0,0,0,0,0,0,7],
		[0,0,2,7,0,0,0,0,0],
		[0,0,0,0,0,0,4,0,0],
		[8,4,0,0,9,0,5,0,0],
		[5,0,7,0,0,3,0,0,8]
		];

	
	$scope.matrix_grid_sol = [
		[6,8,4,3,2,5,7,1,9],
		[9,2,5,1,8,7,6,3,4],
		[3,7,1,4,6,9,8,2,5],
		[7,9,3,8,5,6,1,4,2],
		[4,6,8,9,1,2,3,5,7],
		[1,5,2,7,3,4,9,8,6],
		[2,3,9,5,7,8,4,6,1],
		[8,4,6,2,9,1,5,7,3],
		[5,1,7,6,4,3,2,9,8]
		];


	$scope.matrix_grid_current = [
		[0,0,0,0,2,0,0,0,0],
		[9,0,0,1,8,0,0,0,4],
		[3,0,0,0,6,9,8,0,0],
		[0,9,0,0,0,0,0,0,2],
		[0,6,0,0,0,0,0,0,7],
		[0,0,2,7,0,0,0,0,0],
		[0,0,0,0,0,0,4,0,0],
		[8,4,0,0,9,0,5,0,0],
		[5,0,7,0,0,3,0,0,8]
		];


	// refresh viewed grid
	$scope.refill_grid = function() {
		$scope.wun=false;
		$scope.dic_grid = [
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[]
		];
		
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j <9; j++) {
				$scope.dic_grid[i].push(
					{
						value:"", 
						"val":$scope.matrix_grid_start[i][j], 
						"hyp":false,
						"id": "input"+i.toString()+j.toString(), 
						"rid":i, "cid":j,
						"possibles":[1,2,3,4,5,6,7,8,9]
					});
				// $scope["input"+i+j]="";
			}
		};
	};

	// randomly select an existing grid
	$scope.newGrid = function() {
		// $scope.date = new Date();
		$scope.shown_sol_tab = false;

		var iRandom_grid = (Math.floor((Math.random() * ($scope.grids.length))));
		$scope.set_specific(grids[iRandom_grid]["scode"]);
		$scope.sudoku_id=grids[iRandom_grid]["s_id"];

		$scope.refill_grid();
	};

	// let user select an existing grid
	$scope.setGrid = function() {

		// console.log($scope.singleSelect);
		// console.log($scope.singleSelect.value);

		if (!$scope.singleSelect) {
			$scope.newGrid();
		} else {

			// $scope.date = new Date();
			$scope.shown_sol_tab = false;

			$scope.set_specific(grids[$scope.singleSelect]["scode"]);
			$scope.sudoku_id=grids[$scope.singleSelect]["s_id"];

			$scope.refill_grid();

		};

	};

	// check if user made an hypothesis on this cell value
	$scope.is_hyp = function($rind,$ind) {
		// return (true);
		return ($scope.dic_grid[$rind][$ind]["hyp"]);
	};

	// remove hypothetic cells
	$scope.clean_hyp = function() {
		$scope.hypothesis = false;
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j <9; j++) {
				if ($scope.dic_grid[i][j]["hyp"]==true){
					$scope.dic_grid[i][j]["hyp"]=false;
					$scope.dic_grid[i][j].value="";
					$scope.matrix_grid_current[i][j]=0;
					// $scope.dic_grid[i][j]["possibles"]=$scope.get_complem_vals(i,j);
					// $scope.dic_grid[i][j]["possibles"]=[1,2,3,4,5,6,7,8,9];
				};
			};
		};
		$scope.refresh_possibles();
	};

	// fix hyp. cells into current grid
	$scope.keep_hyp = function() {
		$scope.hypothesis = false;
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j <9; j++) {
				if ($scope.dic_grid[i][j]["hyp"]==true){
					$scope.dic_grid[i][j]["hyp"]=false;
				};
			};
		};
	};

	// check if value should be emphasized
	$scope.bolden_digit = function($val) {
		if ($scope.digit_helper == true){
			// return 1;
			if($val==$scope.bold_digit){
				return 1;
			};
		};
		return 0;
	};

	// validate and highlight cell input
	$scope.check_cell = function($rind,$ind) {

    	// --------- > console.log("rind ind val: " + $rind +"; "+$ind +": " + $scope.dic_grid[$rind][$ind].value);
		var res_class = "";

		// length is 1, its a digit
		if ($scope.dic_grid[$rind][$ind].value.length>1) {
			$scope.dic_grid[$rind][$ind].value=$scope.dic_grid[$rind][$ind].value[0];
		};
		if ($scope.dic_grid[$rind][$ind].value.length>0) {
			if ($scope.dic_grid[$rind][$ind].value.match(intRegex)){
				var locally_valid= true;

                // [check(cell.rid,cell.cid)==1?'bg-success-light':'bg-danger-light',
				if ($scope.local_check == true) {
					locally_valid= $scope.check_locally($rind,$ind);
				}; 

				if (locally_valid) {
					res_class+="bg-success-light";
					if ($scope.hypothesis == true){
						if ($scope.matrix_grid_current[$rind][$ind] == 0){
							$scope.dic_grid[$rind][$ind]["hyp"]=true;
						};
					};

	                // check_finally(cell.rid,cell.cid)? 'fc-ok' : 'fc-wrong',
	                if (!($scope.check_finally($rind,$ind))){
						res_class+=" fc-wrong";
                  	// is_hyp(cell.rid,cell.cid)? 'fc-hyp' : 'fc-ok'
	                } else if ($scope.is_hyp($rind,$ind)){
						res_class+=" fc-hyp";
	                } else {
						res_class+=" fc-ok";
	                };

	              	// bolden_digit(cell.value)==1?'fw-bold':'fw-normal',
					if ($scope.bolden_digit($scope.dic_grid[$rind][$ind].value) == 1){
						res_class+=" fw-bold";					
					} else {
						res_class+=" fw-normal";
	                };

	                // update current grid
					$scope.matrix_grid_current[$rind][$ind] = parseInt($scope.dic_grid[$rind][$ind].value,10);

					$scope.check_wun();
					
					// console.log(res_class);
					return res_class;
				}

			}
			else {
				$scope.dic_grid[$rind][$ind].value="";
			}
		};
		$scope.matrix_grid_current[$rind][$ind] = 0;
		$scope.refresh_possibles();
		res_class+="bg-danger-light";
		// console.log(res_class);		
		return res_class;
	};

	// update possibles
	$scope.refresh_possibles = function() {
		if ($scope.cell_helper|$scope.super_cell_helper) {		
			for (var i = 0; i < 9; i++) {
				for (var j = 0; j <9; j++) {
					// $scope.dic_grid[i][j]["possibles"]=$scope.get_complem_vals(i,j);
					$scope.dic_grid[i][j]["possibles"]=[1,2,3,4,5,6,7,8,9];
				};
			};
			var changing=true;
			var broken=false;
			var poss;
			while (changing){
				broken=false;
				for (var i = 0; i < 9; i++) {
					for (var j = 0; j <9; j++) {
						poss=$scope.calculate_complem_vals(i,j);

						poss.sort();
						if(!(($scope.dic_grid[i][j]["possibles"].sort()).equals(poss))){
							$scope.dic_grid[i][j]["possibles"]=poss;
							broken=true;
							// break;
						};
					};
					// if (broken) break;
				};
				if (!broken) break;
			};
		};
	};	

	// assert cell's value is ok in its row, column, block  
	$scope.check_locally = function($rind,$cind) {
		var romis=$rind%3;
		var comis=$cind%3;

		var neighs=new Set();

		for (var i=0;i<9;i++){
			if (i != $cind) neighs.add($scope.matrix_grid_current[$rind][i]);
		}

		for (var i=0;i<9;i++){
			if (i != $rind) neighs.add($scope.matrix_grid_current[i][$cind]);
		}

		for (var i=$rind-romis;i<$rind-romis+3;i++){
			for (var j=$cind-comis;j<$cind-comis+3;j++){
				// console.log(""+i+j+" "+$scope.matrix_grid_current[i][j])
				if ((i != $rind)|(j !=$cind)) neighs.add($scope.matrix_grid_current[i][j]);
			}
		}

		// console.log(neighs);
		if (neighs.has(parseInt($scope.dic_grid[$rind][$cind].value,10))) return false;

     return true;
	};

	// check win
	$scope.check_wun = function (){
		// var res= true;
		if ($scope.matrix_grid_current[0][0]==0) return;

		for (var i=0;i<9;i++){
			for (var j=0;j<9;j++){
				if ($scope.matrix_grid_current[i][j] != $scope.matrix_grid_sol[i][j]) {
					// res=false;
					// break;
					return;
				};
			};
		};
		$scope.wun=true;
	};
					
	// change emphasized value (on click)	
	$scope.update_digit_help = function($rind,$cind) {
		if (($scope.digit_helper)&($scope.matrix_grid_current[$rind][$cind]!=0)) {
			$scope.bold_digit=$scope.matrix_grid_current[$rind][$cind];
		};
	};

	// indicate possible values wrt current row, column, block
	$scope.get_complem_vals = function($rind,$cind) {
		if (($scope.cell_helper|$scope.super_cell_helper)&($scope.matrix_grid_current[$rind][$cind]==0)) {
		// if ($scope.dic_grid[$rind][$cind]["possibles"].length>0){
			return $scope.dic_grid[$rind][$cind]["possibles"];
		} else {
			return "";
		};
	};	

	
	// calculate possible values wrt current row, column, block
	$scope.calculate_complem_vals = function($rind,$cind) {
		var res =[];
		if (($scope.cell_helper|$scope.super_cell_helper)&($scope.matrix_grid_current[$rind][$cind]==0)) {

			var romis=$rind%3;
			var comis=$cind%3;

			var neighs=new Set();

			// row
			for (var i=0;i<9;i++){
				if (i != $cind) {
					// blacklist neigh values
					neighs.add($scope.matrix_grid_current[$rind][i]);
					// blacklist uniquely possible values
					if (($scope.matrix_grid_current[$rind][i]==0) & ($scope.dic_grid[$rind][i]["possibles"].length==1)) {
						neighs.add($scope.dic_grid[$rind][i]["possibles"][0]);
					}
				}
			}

			for (var i=0;i<9;i++){
				if (i != $rind) {
					neighs.add($scope.matrix_grid_current[i][$cind]);
					if (($scope.matrix_grid_current[i][$cind]==0) & ($scope.dic_grid[i][$cind]["possibles"].length==1)) {
						neighs.add($scope.dic_grid[i][$cind]["possibles"][0]);
					}
				} 
			}

			for (var i=$rind-romis;i<$rind-romis+3;i++){
				for (var j=$cind-comis;j<$cind-comis+3;j++){
					// console.log(""+i+j+" "+$scope.matrix_grid_current[i][j])
					if ((i != $rind)|(j !=$cind)) {
						neighs.add($scope.matrix_grid_current[i][j]);
						if (($scope.matrix_grid_current[i][j]==0) & ($scope.dic_grid[i][j]["possibles"].length==1)) {
							neighs.add($scope.dic_grid[i][j]["possibles"][0]);
						}
					}
				}
			}

			for (var i=0;i<9;i++){
				if (!(neighs.has(i+1))) res.push(i+1);
			};

			// check if any value is only possible here
			if ($scope.super_cell_helper) {
				var res2=[];
				var broken_row,broken_col,broken_block;
				for (var r=0;r<res.length;r++){
					broken_row=false;
					for (var i=0;i<9;i++){
						if (i != $cind) {
							if (($scope.matrix_grid_current[$rind][i]==0) & ($scope.dic_grid[$rind][i]["possibles"].includes(res[r]))) {
								broken_row=true;
								break;
							};
						}
					};

					broken_col=false;
					for (var i=0;i<9;i++){
						if (i != $rind) {
							if (($scope.matrix_grid_current[i][$cind]==0) & ($scope.dic_grid[i][$cind]["possibles"].includes(res[r]))) {
								broken_col=true;
								break;
							};
						}
					};

					broken_block=false;
					for (var i=$rind-romis;i<$rind-romis+3;i++){
						for (var j=$cind-comis;j<$cind-comis+3;j++){
							if ((i != $rind)|(j !=$cind)) {
								if (($scope.matrix_grid_current[i][j]==0) & ($scope.dic_grid[i][j]["possibles"].includes(res[r]))) {
									broken_block=true;
									break;
								};
							}
						};
						if (broken_block) break;
					};

					if (broken_row&broken_col&broken_block) { // is possible elsewhere
						res2.push(res[r]);
					} else {
						res2=[res[r]];
						break;
					};
				};
				res=res2;
			};
		};
		return res;
	};


	// compare with solution
	$scope.check_finally = function($rind,$ind) {
		if ($scope.final_check == true) {
			return ($scope.dic_grid[$rind][$ind].value == $scope.matrix_grid_sol[$rind][$ind]);
		};
		return true;
	};

	// save current (without hypothesis) as an encoded string in a file
	$scope.save_str = function() {
		$scope.clean_hyp();

		$scope.date = new Date();

		var content = $scope.grids_to_string();
		// content="data:application/xml;charset=utf-8, "+content;
		var blob = new Blob([ content ], { type : 'text/plain' });
		$scope.url = (window.URL || window.webkitURL).createObjectURL( blob );
	};

	// encode the (start, sol and current) grids in a string 
	$scope.grids_to_string = function() {
		
		var str_int="";
		var dec_int=0;
		var str_res="";
		for (var i = 0; i < 9; i++) {
			str_int="";
			for (var j = 0; j <9; j++) {
				str_int+=$scope.matrix_grid_start[i][j];
			};
			dec_int=parseInt(str_int,10);
			str_res+=$scope.encode_64(dec_int);
		};
		for (var i = 0; i < 9; i++) {
			str_int="";
			for (var j = 0; j <9; j++) {
				str_int+=$scope.matrix_grid_sol[i][j];
			};
			dec_int=parseInt(str_int,10);
			str_res+=$scope.encode_64(dec_int);
		};
		for (var i = 0; i < 9; i++) {
			str_int="";
			for (var j = 0; j <9; j++) {
				str_int+=$scope.matrix_grid_current[i][j];
			};
			dec_int=parseInt(str_int,10);
			str_res+=$scope.encode_64(dec_int);
		};

		// str_res+='|';
		// console.log(str_res);

		return(str_res);

	};

	// decode a string into (start, sol and current) grids
	$scope.string_to_grids = function($str) {
		var pstr=$str;
		var chunk;
		var row_val=0;
		var row_str="";

		while (pstr.length<5*9*3) pstr+="0";
		for (var i = 0; i < 9; i++) {
			chunk=pstr.substring(5*i, 5*i+5); 
			row_val=0;
			row_str="";
			for (var j = 0; j <5; j++) {
				row_val+=alphabet.indexOf(chunk[j])*64**(4-j);
			};
			row_str+=row_val;
			while (row_str.length<9) row_str="0"+row_str;
			for (var k = 0; k < 9; k++) {
				$scope.matrix_grid_start[i][k]=parseInt(row_str[k],10);
				// if (row_str[k]!="0") {
				// 	$scope.dic_grid[i][k]["val"]=row_str[k];
			};
		};
		// console.log($scope.matrix_grid_start);
		// refresh
		$scope.refill_grid();

		for (var i = 9; i < 18; i++) {
			chunk=pstr.substring(5*i, 5*i+5); 
			row_val=0;
			row_str="";
			for (var j = 0; j <5; j++) {
				row_val+=alphabet.indexOf(chunk[j])*64**(4-j);
			};
			row_str+=row_val;
			while (row_str.length<9) row_str="0"+row_str;
			for (var k = 0; k < 9; k++) {
				$scope.matrix_grid_sol[i-9][k]=parseInt(row_str[k],10);
			};

		};
		// console.log($scope.matrix_grid_sol);

		for (var i = 18; i < 27; i++) {
			chunk=pstr.substring(5*i, 5*i+5); 
			row_val=0;
			row_str="";
			for (var j = 0; j <5; j++) {
				row_val+=alphabet.indexOf(chunk[j])*64**(4-j);
			};
			row_str+=row_val;
			while (row_str.length<9) row_str="0"+row_str;
			for (var k = 0; k < 9; k++) {
				$scope.matrix_grid_current[i-18][k]=parseInt(row_str[k],10);
				if (row_str[k]!="0") {
					$scope.dic_grid[i-18][k].value=row_str[k];
				} else {
					$scope.dic_grid[i-18][k].value="";
				};

			};

		};
		// console.log($scope.matrix_grid_current);

	};

	// import a string from file
	$scope.set_specific_file = function() {
		// console.log("$scope.file_content");
		// console.log($scope.file_content);
		$scope.string_to_grids($scope.file_content);
		$scope.sudoku_id=0;
		// check if known grid
		for (var grid=0; grid<grids.length; grid++){
			if ($scope.file_content.substring(0,5*9)===grids[grid]["scode"].substring(0,5*9)){
				$scope.sudoku_id=grid+1;
				break;
			}
		}
		$scope.shown_sol_tab = false;
	};

	// set a given sudoku from a string
	$scope.set_specific = function($str) {
		$scope.string_to_grids($str);
		$scope.sudoku_id=0;
		// $scope.shown_sol_tab = false;


	};

	// encode an int < 64**5
	$scope.encode_64 = function($dec_int) {
		//https://stackoverflow.com/questions/4228356/how-to-perform-an-integer-division-and-separately-get-the-remainder-in-javascr
		// var quotient = Math.floor(y/x);
		// var remainder = y % x;

		var str_res="";

		// power sixty four
		var psf=4;
		var temp_prev=$dec_int;
		var temp=$dec_int-64**psf;
		var q=1;

		// decompose in powers of 64
		while (psf>=0){
			// it's tinier
			while((temp <0)&(psf>=0)) {
				psf--;	
				str_res+=alphabet[0];
				temp=temp_prev;
				temp-=64**psf;
			} 
			if (psf==-1) break;

			q=2;
			temp_prev=temp;
			temp-=64**psf;

			// it's more than once
			while(temp >=0 ) {
				q++;	
				temp_prev=temp;
				temp-=64**psf;
			}

			str_res+=alphabet[q-1];
			psf--;	
			temp=temp_prev;
			temp-=64**psf;
		};
		
		return(str_res);
	};

	//toggle view of the solution grid
	$scope.show_sol_tab = function(){
		// $scope.shown_sol_tab = true;
		$scope.shown_sol_tab = !($scope.shown_sol_tab);
	};	
});


