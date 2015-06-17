<?php
/**
 * Wokingham Vineyard Admin Customisation
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */

require get_template_directory() . '/admin/functions.php';

// Connect Groups
require get_template_directory() . '/admin/connect-groups.php';

// People
require get_template_directory() . '/admin/people.php';

// Teams
require get_template_directory() . '/admin/teams.php';
