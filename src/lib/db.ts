import { createClient } from '@supabase/supabase-js';
import { readable } from 'svelte/store';
import { goto } from '$app/navigation';
import { loading } from './utils/stores';

const dbAPI = async (query) => {
	return await query;
};

const Loader = (fn) => {
	return async function (query) {
		loading.set(true);
		const { data, error } = await query;
		loading.set(false);
		return { data, error };
	};
};

const AuthLoader = (fn) => {
	return async function (query) {
		loading.set(true);
		const { error, session } = await query;
		loading.set(false);
		return { error, session };
	};
};

const loaderQuery = Loader(dbAPI);
const authLoaderQuery = AuthLoader(dbAPI);

export const supabase = createClient(
	String(import.meta.env.VITE_SUPABASE_URL),
	String(import.meta.env.VITE_SUPABASE_ANON_KEY)
);

export const user = readable(supabase.auth.user(), (set) => {
	supabase.auth.onAuthStateChange((event, session) => {
		if (event == 'SIGNED_OUT') {
			set(null);
			goto('/');
		} else if (event == 'SIGNED_IN') {
			set(session.user);
		}
	});
});

export async function signOut() {
	await supabase.auth.signOut();
}

export const auth = {
	async signIn(data: object) {
		const query = supabase.auth.signIn(data);
		return await authLoaderQuery(query);
	},

	async signUp(data: object) {
		const query = supabase.auth.signUp(data);
		return await authLoaderQuery(query);
	},

	async signOut() {
		return await supabase.auth.signOut();
	}
};


export const userProfiles= {
	async get() {
		const query = supabase.from('user_profiles').select('*');
		return await loaderQuery(query);	
	}
};

export const bummers= {
	async get(username: string) {
		const query = supabase.from('bummers').select('*').eq('username', username);
		return await loaderQuery(query);	
	}
}