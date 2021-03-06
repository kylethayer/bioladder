<?php

namespace MediaWiki\Extensions\ParserFunctions;

use Parser;

class Hooks {

	/**
	 * Enables string functions during parser tests.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ParserTestGlobals
	 *
	 * @param array &$globals
	 */
	public static function onParserTestGlobals( array &$globals ) {
		$globals['wgPFEnableStringFunctions'] = true;
	}

	/**
	 * Registers our parser functions with a fresh parser.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ParserFirstCallInit
	 *
	 * @param Parser $parser
	 */
	public static function onParserFirstCallInit( Parser $parser ) {
		global $wgPFEnableStringFunctions;

		// These functions accept DOM-style arguments
		$class = ParserFunctions::class;
		$parser->setFunctionHook( 'if', "$class::ifObj", Parser::SFH_OBJECT_ARGS );
		$parser->setFunctionHook( 'ifeq', "$class::ifeqObj", Parser::SFH_OBJECT_ARGS );
		$parser->setFunctionHook( 'switch', "$class::switchObj", Parser::SFH_OBJECT_ARGS );
		$parser->setFunctionHook( 'ifexist', "$class::ifexistObj", Parser::SFH_OBJECT_ARGS );
		$parser->setFunctionHook( 'ifexpr', "$class::ifexprObj", Parser::SFH_OBJECT_ARGS );
		$parser->setFunctionHook( 'iferror', "$class::iferrorObj", Parser::SFH_OBJECT_ARGS );
		$parser->setFunctionHook( 'time', "$class::timeObj", Parser::SFH_OBJECT_ARGS );
		$parser->setFunctionHook( 'timel', "$class::localTimeObj", Parser::SFH_OBJECT_ARGS );

		$parser->setFunctionHook( 'expr', "$class::expr" );
		$parser->setFunctionHook( 'rel2abs', "$class::rel2abs" );
		$parser->setFunctionHook( 'titleparts', "$class::titleparts" );

		// String Functions: enable if configured
		if ( $wgPFEnableStringFunctions ) {
			$parser->setFunctionHook( 'len',       "$class::runLen" );
			$parser->setFunctionHook( 'pos',       "$class::runPos" );
			$parser->setFunctionHook( 'rpos',      "$class::runRPos" );
			$parser->setFunctionHook( 'sub',       "$class::runSub" );
			$parser->setFunctionHook( 'count',     "$class::runCount" );
			$parser->setFunctionHook( 'replace',   "$class::runReplace" );
			$parser->setFunctionHook( 'explode',   "$class::runExplode" );
			$parser->setFunctionHook( 'urldecode', "$class::runUrlDecode" );
		}
	}

	/**
	 * Registers ParserFunctions' lua function with Scribunto
	 *
	 * @see https://www.mediawiki.org/wiki/Extension:Scribunto/ScribuntoExternalLibraries
	 *
	 * @param string $engine
	 * @param string[] &$extraLibraries
	 */
	public static function onScribuntoExternalLibraries( $engine, array &$extraLibraries ) {
		if ( $engine === 'lua' ) {
			$extraLibraries['mw.ext.ParserFunctions'] = LuaLibrary::class;
		}
	}
}
