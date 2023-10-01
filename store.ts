import { writable } from 'svelte/store';
import { tag_list } from './actions';
import type { Tag } from './types';

// create a writable store for the LiWEUser
export const tags = writable<string[] | null>( null );

export const tags_init = async () => {
	const res = await tag_list();
	const data: string[] = [];

	if ( res.error ) return;

	( res as Tag[] ).forEach( ( tag: Tag ) => {
		data.push( tag.name );
	} );

	tags.set( data );
};
