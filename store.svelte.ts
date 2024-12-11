import {
	tag_admin_add,
	tag_admin_list,
	tag_admin_update,
	tag_admin_fields,
	tag_admin_module_add,
	tag_admin_module_del,
	tag_list,

} from './actions';
import type { Tag } from './types';

type TagFields = Partial<Tag>;

interface TagStore {
	tags: { [ key: string ]: Tag; };
	initiated: boolean;

	add: ( data: Tag ) => Promise<Tag | undefined>;
	update: ( data: Tag ) => Promise<Tag | undefined>;
	fields: ( id: string, data: TagFields ) => Promise<Tag | undefined>;
	moduleAdd: ( id: string, module: string ) => Promise<Tag | undefined>;
	moduleDel: ( id: string, module: string ) => Promise<Tag | undefined>;
	get: ( id: string ) => Tag | undefined;
	loadAll: () => Promise<Tag[] | undefined>;
	load: () => Promise<Tag[] | undefined>;
	list: () => Tag[];
}

const manageModules = async ( res: Tag, data: Tag ) => {
	const dataModules = data.modules || [];
	const resModules = res.modules || [];

	const delModRes = await Promise.all( resModules.map( ( module ) => tag_admin_module_del( res.id, module ) ) );

	if ( delModRes.some( ( r ) => r.error ) ) {
		console.error( 'Error cleaning modules' );
		return;
	}

	dataModules.push( 'system' );
	const addModRes = await Promise.all( dataModules.map( ( module ) => tag_admin_module_add( res.id, module ) ) );

	if ( addModRes.some( ( r ) => r.error ) ) {
		console.error( 'Error adding modules' );
	} else {
		res.modules = dataModules;
	}
	return res;
};

export const storeTag: TagStore = $state( {
	tags: {},
	initiated: false,
	add: async ( data: Tag ) => {
		if ( !data.name ) {
			console.error( 'Missing required fields' );
			return;
		}
		let res = await tag_admin_add( data.name, data.visible );
		if ( res.error ) return;

		res = await manageModules( res, data );

		storeTag.tags[ res.id ] = res;
		return res;
	},
	update: async ( data: Tag ) => {
		if ( !data.id || !data.name ) {
			console.error( 'Missing required fields' );
			return;
		}
		let res = await tag_admin_update( data.id, data.name, data.visible );
		if ( res.error ) return;

		res = await manageModules( res, data );
		console.log( 'store.update', res );

		storeTag.tags[ res.id ] = res;
		return res;
	},
	fields: async ( id: string, data: TagFields ) => {
		const res = await tag_admin_fields( id, data );
		if ( res.error ) return;
		storeTag.tags[ res.id ] = res;
		return res;
	},
	moduleAdd: async ( id: string, module: string ) => {
		const res = await tag_admin_module_add( id, module );
		if ( res.error ) return;
		storeTag.tags[ res.id ] = res;
		return res;
	},
	moduleDel: async ( id: string, module: string ) => {
		const res = await tag_admin_module_del( id, module );
		if ( res.error ) return;
		storeTag.tags[ res.id ] = res;
		return res;
	},
	get: ( id: string ) => {
		return storeTag.tags[ id ];
	},
	loadAll: async () => {
		const res = await tag_admin_list();
		if ( res.error ) return;
		res.forEach( ( tag: Tag ) => {
			storeTag.tags[ tag.id ] = tag;
		} );
		storeTag.initiated = true;
		return Object.values( storeTag.tags );
	},
	load: async () => {
		const res = await tag_list();
		if ( res.error ) return;
		res.forEach( ( tag: Tag ) => {
			storeTag.tags[ tag.id ] = tag;
		} );
		storeTag.initiated = true;
		return Object.values( storeTag.tags );
	},
	list: () => {
		return Object.values( storeTag.tags );
	}
} );