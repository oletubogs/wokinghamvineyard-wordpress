<?php
/**
 * Wokingham Vineyard Admin Functions
 *
 * @package WordPress
 * @subpackage Wokingham_Vineyard
 * @since Wokingham Vineyard 1.0
 */

function getLeadersListFromIds($leaderIds, $links = true) {
  $leaders = array();
  foreach ($leaderIds as $leaderId) {
    // Get leader names
    $firstName = get_post_meta( $leaderId, 'first_name', true);
    $familyName = get_post_meta( $leaderId, 'family_name', true);

    // Search array for surname matches
    $matches = null;
    for ( $i=0; $i < count($leaders); $i++ ) {
      if ($leaders[$i]['family_name'] == $familyName) {
        $matches = array('id' => $leaders[$i]['id'], 'first_name' => $leaders[$i]['first_name']);
        // Remove matching
        unset($leaders[$i]);
      }
    }

    $leaders[] = array('id' =>$leaderId, 'first_name' => $firstName, 'family_name' => $familyName, 'matches' => $matches);
  }

  $leaderNames = '';
  foreach ($leaders as $leader) {

    if ($links) {
      $leaderNames .= ' & <a target="new" href="post.php?post=' . $leader['id'] . '&action=edit">' . $leader['first_name'];
    } else {
      $leaderNames .= ' & ' . $leader['first_name'];
    }

    if (!empty($leader['matches'])) {
      if ($links) {
        $leaderNames .=  '</a> & <a target="new" href="post.php?post='. $leader['matches']['id'] . '&action=edit">' . $leader['matches']['first_name'] . ' ' . $leader['family_name'] . '</a>';
      } else {
        $leaderNames .=  ' & ' . $leader['matches']['first_name'] . ' ' . $leader['family_name'];
      }
    } else {
      if ($links) {
        $leaderNames .= ' ' . $leader['family_name'] . '</a>';
      } else {
        $leaderNames .= ' ' . $leader['family_name'];
      }
    }
  }
  return substr($leaderNames, 3);
}


function mergeTeamMembersByPhoto($members) {

  $team = array();

  foreach ($members as $member) {
    $team[] = $member;
  }

  // Loop through $members
  $i = 0;
  foreach ($team as $member) {
    // Add photo to $members
    $pastoral_couple_photo = get_field( 'pastoral_couple_photo', $member['person']->ID );
    if ( !empty ($pastoral_couple_photo) ) {
      $team[$i]['pastoral_couple_photo'] = $pastoral_couple_photo['sizes']['landscape'];
    }


    // Match other members by photo
    $a = 0;
    foreach ($team as $memberSearch) {
      if ( $team[$a] !== $team[$i]
        && !empty( $team[$a]['pastoral_couple_photo'] )
        && !empty( $team[$i]['pastoral_couple_photo'] )
        && $team[$a]['pastoral_couple_photo'] == $team[$i]['pastoral_couple_photo']
      ) {

        // Merge names
        if ($team[$i]['person']->family_name == $team[$a]['person']->family_name) {
          $team[$i]['person']->merged_name = $team[$i]['person']->first_name . ' & ' . $team[$a]['person']->first_name . ' ' . $team[$a]['person']->family_name;
        } else {
          $team[$i]['person']->merged_name = $team[$i]['person']->first_name . ' ' . $team[$i]['person']->family_name . ' & ' . $team[$a]['person']->first_name . ' ' . $team[$a]['person']->family_name;
        }

        // Merged photo
        $team[$i]['person']->merged_photo = $team[$i]['pastoral_couple_photo'];

        // Pluralise position name
        $team[$i]['role'] = str_replace('Pastor', 'Pastors', $team[$i]['role']);

        unset($team[$a]);
      }
      $a++;
    }
    $i++;
  }

  // Return $members
  return $team;
}
