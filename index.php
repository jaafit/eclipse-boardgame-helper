<?php //ob_start(); ?>

<!DOCTYPE html>
<html class="no-js">
<head>
	<meta charset="utf-8">
	<title>Eclipse Helper</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
	<link rel="stylesheet" href="css/style.css">
	<link rel="icon" type="image/png" href="img/icon.png">
</head>
<body>

<nav class="navbar navbar-default" role="navigation">
	<ul class="nav navbar-nav">
		<li class="active"><a href="#about" data-toggle="tab">About</a></li>
		<li><a href="#cannons" data-toggle="tab">Cannons</a></li>
		<li><a href="#dice" data-toggle="tab">Dice</a></li>
		<li><a href="#battle" data-toggle="tab">Battle</a></li>
		<li><a href="#races" data-toggle="tab">Races</a></li>
	</ul>
</nav>

<div class="container">
	<div class="tab-content">
		<!-- ABOUT -->
		<?php
			require_once __DIR__ . '/Parsedown.php';
			$readme = file(__DIR__ . '/README.md');
			unset($readme[2]);
			$readme = implode(PHP_EOL, $readme);
		?>
		<div class="tab-pane active" id="about">
			<?= (new Parsedown())->text($readme); ?>
		</div>
		<!-- /ABOUT -->

		<!-- CANNONS -->
		<div class="tab-pane" id="cannons">
			<div class="row">
				<div class="col-xs-2 game-counter-label">Ion</div>
				<div class="col-xs-2 game-counter-label">Plasma</div>
                <div class="col-xs-2 game-counter-label">Soliton</div>
				<div class="col-xs-2 game-counter-label">Antimatter</div>
                <div class="col-xs-2 game-counter-label">Rift</div>
				<div class="col-xs-2 game-counter-label">Computers + Shields</div>
			</div>
			<div class="row">
				<?= counter('cannons_ion', 2, 'game-ion') ?>
				<?= counter('cannons_plasma', 2, 'game-plasma') ?>
                <?= counter('cannons_soliton', 2, 'game-soliton') ?>
				<?= counter('cannons_antimatter', 2, 'game-antimatter') ?>
                <?= counter('cannons_rift', 2, 'game-rift') ?>
				<?= counter('cannons_computer', 2, 'game-computer') ?>
			</div>
			<div class="row">
				<button class="btn btn-lg btn-primary col-xs-12" id="cannons_calc">Calc</button>
			</div>
			<div class="row" id="cannons_result"></div>
		</div>
		<!-- /CANNONS -->

		<!-- DICE -->
		<div class="tab-pane" id="dice">
			<div class="row">
				<?= counter('dice_ion', 2, 'game-ion') ?>
				<?= counter('dice_plasma', 2, 'game-plasma') ?>
                <?= counter('dice_soliton', 2, 'game-soliton') ?>
				<?= counter('dice_antimatter', 2, 'game-antimatter') ?>
                <?= counter('dice_rift', 2, 'game-rift') ?>
			</div>
			<div class="row">
				<button class="btn btn-lg btn-primary col-xs-12" id="dice_throw">Throw</button>
			</div>
			<div class="row" id="dice_result"></div>
		</div>
		<!-- /DICE -->

		<!-- BATTLE -->
		<div class="tab-pane" id="battle">

            <div class="fleet">
                <h2>Your Fleet<button class="btn clear-fleet-btn pull-right">Clear</button></h2>
                <?= battleShip('battle_first_interceptor', 'Interceptors', array('initiative' => 3)) ?>
                <?= battleShip('battle_first_cruiser', 'Cruisers', array('initiative' => 2)) ?>
                <?= battleShip('battle_first_dreadnought', 'Dreadnoughts', array('initiative' => 1)) ?>
                <?= battleShip('battle_first_starbase', 'Starbases', array('initiative' => 4)) ?>
                <?= battleTechnologies('battle_first_technology') ?>
                <?= battleSide('battle_first_side', true) ?>
            </div>

            <div class="row">
                <button class="btn btn-lg btn-primary col-xs-12 battle_run">Run Battle</button>
            </div>


            <div class="fleet">
                <h2>Their Fleet<button class="btn clear-fleet-btn pull-right">Clear</button></h2>
                <?= battleShip('battle_second_interceptor', 'Interceptors', array('initiative' => 3)) ?>
                <?= battleShip('battle_second_cruiser', 'Cruisers', array('initiative' => 2)) ?>
                <?= battleShip('battle_second_dreadnought', 'Dreadnoughts', array('initiative' => 1)) ?>
                <?= battleShip('battle_second_starbase', 'Starbases', array('initiative' => 4)) ?>

                <?= battleTechnologies('battle_second_technology') ?>
                <?= battleSide('battle_first_side', false) ?>
            </div>


			<div class="row">
				<button class="btn btn-lg btn-primary col-xs-12 battle_run">Run Battle</button>
			</div>

            <div class="panel panel-default battle-side">
                <div class="panel-heading">Number of battles</div>
                <div class="panel-body panel-visible">
                    <div class="btn-group col-xs-12 game-counter" data-list="1,10,25,50,100,250,500,1000,2500,5000,10000,25000,50000,100000">
                        <button class="btn btn-primary game-counter-minus col-xs-4">-</button>
                        <button class="btn btn-primary game-counter-value col-xs-4 active" id="battle_number" data-value="9">5000</button>
                        <button class="btn btn-primary game-counter-plus col-xs-4">+</button>
                    </div>
                </div>
            </div>

            <a name="results" id="battle_result_anchor"></a>
			<h2>Results</h2>
			<div class="row battle-result" id="battle_result"><i>Click "Run Battle" to get results</i></div>
		</div>
		<!-- /BATTLE -->

		<!-- RACES -->
		<div class="tab-pane" id="races">
			<div class="row" id="race_percents">
				<?= counterRace('race_1', 'img/EridaniEmpire.png') ?>
				<?= counterRace('race_2', 'img/HydranProgress.png') ?>
				<?= counterRace('race_3', 'img/Planta.png') ?>
				<?= counterRace('race_4', 'img/DescendantsOfDraco.png') ?>
				<?= counterRace('race_5', 'img/Mechanema.png') ?>
				<?= counterRace('race_6', 'img/OrionHegemony.png') ?>
				<?= counterRace('race_11', 'img/TerranFederation.png') ?>
			</div>
			<div class="row">
				<button class="btn btn-lg btn-primary col-xs-12" id="race_run">Get random race</button>
			</div>
			<h2>Selected race</h2>
			<div class="race-result" id="race_result"></div>
		</div>
		<!-- /RACES -->
	</div>
</div>

<script src="js/jquery.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/script.js"></script>

</body>
</html>

<?php

function counter($id, $size = 3, $class = '', $default = 0, $large = true, $label = null, $blockClass = '')
{
    $printedDefault = $default ? $default : '';
	if ($large) { $class .= ' btn-group-lg'; }
	if ($label) {
		return sprintf('
		<div class="col-xs-%d game-counter-block %s">
			<div class="game-counter-label">%s</div>
			<div class="btn-group-vertical game-counter %s">
				<button class="btn game-counter-plus">+</button>
				<button class="btn game-counter-value active" id="%s" data-value="%d">%s</button>
				<button class="btn game-counter-minus">-</button>
			</div>
		</div>
		', $size, $blockClass, $label, $class, $id, $default, $printedDefault);
	} else {
		return sprintf('
		<div class="btn-group-vertical col-xs-%d game-counter %s">
			<button class="btn game-counter-plus">+</button>
			<button class="btn game-counter-value active" id="%s" data-value="%d">%s</button>
			<button class="btn game-counter-minus">-</button>
		</div>
		', $size, $class, $id, $default, $printedDefault);
	}
}

function counterRace($id, $imgSrc = '') {
	return sprintf('
		<div class="btn-group-vertical btn-group-lg col-xs-4 col-sm-3 col-md-2 game-counter game-counter-race"
			 data-list="0%%,20%%,40%%,60%%,80%%,100%%,120%%,140%%,160%%,180%%,200%%">
			<button class="btn game-counter-plus">+</button>
			<button class="btn game-counter-img active"><img src="%s"></button>
			<button class="btn game-counter-value active" id="%s" data-value="5">100%%</button>
			<button class="btn game-counter-minus">-</button>
		</div>
		', $imgSrc, $id);
}

function battleShip($idPrefix, $title = 'Ships', array $defaults = array(), $panelClass = '')
{
	return '
		<div class="panel '.$panelClass.' panel-default clear-group battle-ship-group">
			<div class="panel-heading">' . $title . '<button class="btn clear-btn pull-right">Clear</button></div>
			<div class="panel-body">
				<div class="row">
					' . counter($idPrefix . '_number', 2, 'game-number', (int)@$defaults['number'], false, 'Ships') . '
					' . counter($idPrefix . '_hull', 2, '', (int)@$defaults['hull'], false, 'Hull') . '
					' . counter($idPrefix . '_morph', 2, '', (int)@$defaults['morph'], false, 'Regen') . '
					' . counter($idPrefix . '_computer', 2, 'game-computer', (int)@$defaults['computer'], false, 'Computer') . '
					' . counter($idPrefix . '_shield', 2, 'game-shield negative', (int)@$defaults['shield'], false, 'Shield') . '
					' . counter($idPrefix . '_initiative', 2, '', (int)@$defaults['initiative'], false, 'Initiative') . '
				</div>

				<div class="row">				    
					' . counter($idPrefix . '_cannon_ion', 1, 'game-ion', (int)@$defaults['cannon_ion'], false) . '
					' . counter($idPrefix . '_cannon_plasma', 1, 'game-plasma', (int)@$defaults['cannon_plasma'], false) . '					
					' . counter($idPrefix . '_cannon_soliton', 1, 'game-soliton', (int)@$defaults['cannon_soliton'], false) . '
					' . counter($idPrefix . '_cannon_antimatter', 1, 'game-antimatter', (int)@$defaults['cannon_antimatter'], false) . '
					' . counter($idPrefix . '_cannon_rift', 1, 'game-rift', (int)@$defaults['cannon_rift'], false) . '
					<div class="col-xs-2"><img class="missile_icon" src="img/missile.png"/></div>
					' . counter($idPrefix . '_missile_ion', 1, 'game-ion', (int)@$defaults['missile_ion'], false) . '
					' . counter($idPrefix . '_missile_plasma', 1, 'game-plasma', (int)@$defaults['missile_plasma'], false) . '
					' . counter($idPrefix . '_missile_soliton', 1, 'game-soliton', (int)@$defaults['missile_soliton'], false) . '
					' . counter($idPrefix . '_missile_antimatter', 1, 'game-antimatter', (int)@$defaults['missile_antimatter'], false) . '
				</div>
			</div>
		</div>
	';

	// could add NPCs here
    // interceptor A: 2 ion, 2 init, 1 comp, 1 hull
    // interceptor B: 1 plasma, 1 init, 1 comp, 2 hull
    // guardian A: 3 ion, 2 computer, 3 init, 2 hull
    // guardian B: 2 plasma missles, 1 AM, 1 comp, 3 hull, 1 init
    // GDS A: 4 ions, 2 computers, 7 hull, 0 init
    // GDS B: 4 ion missiles, 1 AM, 2 comp, 3 hull
}

function npcImg($name) {
    return "<img id=\"npc_'.$name.' class=\"npc $name\" src=\"img/npcs/$name.png\"/>";
}

function npcShip() {
    return '<div id="npcbuttons">'
            .npcImg('ancientA')
            .npcImg('ancientB')
            .npcImg('guardianA')
            .npcImg('guardianB')
            .npcImg('gdsA')
            .npcImg('gdsB')
        .'</div>'
        .battleShip('battle_second_npc', 'Non-player character', array(), 'npc');
}

function battleTechnologies($idPrefix)
{
	return sprintf('
		<div class="panel panel-default battle-technologies">
			<div class="panel-heading">Technologies</div>
			<div class="panel-body">
				<div class="btn-group col-xs-12">
					<button id="%s_antimatter_splitter" class="btn col-xs-4 button-checkbox" data-value="0">Antimatter Splitter</button>
					<!--<button id="%s_distortion_shield" class="btn col-xs-4 button-checkbox" data-value="0">Distortion Shield</button>-->
					<!--<button id="%s_point_defence" class="btn col-xs-4 button-checkbox" data-value="0">Point Defence</button>-->
				</div>
			</div>
		</div>
	', $idPrefix, $idPrefix, $idPrefix);
}

function battleSide($idPrefix, $attack = false)
{
	return '
		<div class="panel panel-default battle-side">
			<div class="panel-body panel-visible">
				<div class="btn-group col-xs-12">
					' . battleSideButton($idPrefix, true, $attack) . '
					' . battleSideButton($idPrefix, false, $attack) . '
				</div>
			</div>
		</div>
	';
}

function battleSideButton($idPrefix, $typeAttack, $attack)
{
	$value = $typeAttack == $attack ? 1 : 0;
	if ($typeAttack) {
		$class = $typeAttack == $attack ? 'btn-danger' : '';
		return sprintf(
			'<button id="%s_attack" class="btn col-xs-6 button-radio %s" data-value="%d" data-side="attack" data-class="btn-danger">Attack</button>',
			$idPrefix, $class, $value);
	} else {
		$class = $typeAttack == $attack ? 'btn-success' : '';
		return sprintf(
			'<button id="%s_defence" class="btn col-xs-6 button-radio %s" data-value="%d" data-side="defence" data-class="btn-success">Defence</button>',
			$idPrefix, $class, $value);
	}
}

//file_put_contents('index.html', trim(ob_get_contents()));
//return ob_end_clean();
//header ('Location: index.html');

?>