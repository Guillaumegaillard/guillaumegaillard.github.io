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

	$scope.version_Sudoku_Gui = "1.4";

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

	// currently clicked indices
	$scope.cur_row_ck=-1;
	$scope.cur_col_ck=-1;

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


	// detect if browser is a mobile browser
	// $scope.detectMob =  function () {
	// 	return ( ( window.innerWidth <= 800 ) && ( window.innerHeight <= 600 ) );
	// };
	// https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
	// should try https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device
	$scope.detectMob = function() {
		// return true;
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
	};

	// force input focus to helper field
	$scope.keep_keyboard_still = function () {
	    var myEl = document.getElementById('tofocus');
		// var angularEl = angular.element(myEl);
		myEl.focus();
		// angularEl.focus();
		$scope.cur_row_ck=-1;
        $scope.cur_col_ck=-1;
    };

	// indicate possible values wrt current row, column, block
	$scope.get_complem_vals_current = function() {
		return $scope.get_complem_vals($scope.cur_row_ck,$scope.cur_col_ck);
	};	

	// update current row, column indices
	$scope.set_clicked = function($rind,$cind) {
		$scope.cur_row_ck=$rind;
		$scope.cur_col_ck=$cind;
	};	

	// refresh viewed grid
	$scope.refill_grid = function() {
		$scope.wun=false;
		$scope.set_clicked(-1,-1);
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
						"possibles":[1,2,3,4,5,6,7,8,9],
						"pos_init":[1,2,3,4,5,6,7,8,9]
					});
				// $scope["input"+i+j]="";
			}
		};
		$scope.refresh_possibles_init();
	};

	// randomly select an existing grid
	$scope.newGrid = function() {
		// $scope.date = new Date();
		$scope.shown_sol_tab = false;

		var iRandom_grid = (Math.floor((Math.random() * ($scope.grids.length))));
		$scope.set_specific(grids[iRandom_grid]["scode"]);
		$scope.sudoku_id=grids[iRandom_grid]["s_id"];

		$scope.refill_grid();
		// $scope.keep_keyboard_still();
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
		$scope.keep_keyboard_still();
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
        $scope.keep_keyboard_still();
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
		var did_change= false;
		var locally_valid= true;

		// length is 1, its a digit
		if ($scope.dic_grid[$rind][$ind].value.length>1) {
			$scope.dic_grid[$rind][$ind].value=$scope.dic_grid[$rind][$ind].value[0];
		};
		if ($scope.dic_grid[$rind][$ind].value.length>0) {
			if (!($scope.matrix_grid_current[$rind][$ind].toString()==$scope.dic_grid[$rind][$ind].value)) {
				//did change
				did_change=true;
				if ($scope.dic_grid[$rind][$ind].value.match(intRegex)){
	                // [check(cell.rid,cell.cid)==1?'bg-success-light':'bg-danger-light',
					if ($scope.local_check == true) {
						locally_valid= $scope.check_locally($rind,$ind);
					} else {
						locally_valid=true;
					}; 

				} else {
					//need to empty crap
					$scope.dic_grid[$rind][$ind].value="";
				};
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
                if (did_change){
					$scope.matrix_grid_current[$rind][$ind] = parseInt($scope.dic_grid[$rind][$ind].value,10);
					$scope.check_wun();
					$scope.refresh_possibles();
                };				
				// console.log(res_class);
				return res_class;
			};
		} else {
			locally_valid=false;
			//length 0 value==""
			if ($scope.matrix_grid_current[$rind][$ind] != 0){
				did_change=true;
				$scope.matrix_grid_current[$rind][$ind] = 0;
				// $scope.dic_grid[$rind][$ind].value="";
			};
		};
		if (did_change) $scope.refresh_possibles();
		res_class+="bg-danger-light";
		// console.log(res_class);		
		return res_class;
	};


	// update initial possibles
	$scope.refresh_possibles_init = function() {
		// console.log("refreshing init possibles");
		var local_cell_helper=$scope.cell_helper;
		var local_super_cell_helper=$scope.super_cell_helper;

		$scope.cell_helper = true;
		$scope.super_cell_helper = false;


		var changing=true;
		var broken=false;
		var poss;
		while (changing){
			broken=false;
			for (var i = 0; i < 9; i++) {
				for (var j = 0; j <9; j++) {
					poss=$scope.calculate_complem_vals(i,j);

					poss.sort();
					if(!(($scope.dic_grid[i][j]["pos_init"].sort()).equals(poss))){
						$scope.dic_grid[i][j]["pos_init"]=poss;
						broken=true;
						// break;
					};
				};
				// if (broken) break;
			};
			if (!broken) break;
		};

		$scope.cell_helper = local_cell_helper;
		$scope.super_cell_helper = local_super_cell_helper;
	};	

	// update possibles
	$scope.refresh_possibles = function() {
		// console.log("refreshing possibles");
		if ($scope.cell_helper|$scope.super_cell_helper) {		
			for (var i = 0; i < 9; i++) {
				for (var j = 0; j <9; j++) {
					// $scope.dic_grid[i][j]["possibles"]=$scope.get_complem_vals(i,j);
					// $scope.dic_grid[i][j]["possibles"]=[1,2,3,4,5,6,7,8,9];
					$scope.dic_grid[i][j]["possibles"]=$scope.dic_grid[i][j]["pos_init"];
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
		if ($rind==-1) return "";
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


