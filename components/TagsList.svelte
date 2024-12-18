<script lang="ts">
    import Modal from '$liwe3/components/Modal.svelte';
    import DataGrid from '$liwe3/components/DataGrid.svelte';
    import TagForm from '$modules/tag/components/subs/TagForm.svelte';
    import { onMount } from 'svelte';

    import { Pencil } from 'svelte-hero-icons';

    import { storeTag } from '$modules/tag/store.svelte';

    import type { DataGridAction, DataGridButton, DataGridField, DataGridRow } from '$liwe3/components/DataGrid.svelte';
    import type { PaginatorButtons } from '$liwe3/components/Paginator.svelte';
    import type { Tag } from '$modules/tag/types';

    interface TagAdminListProps {
        modules?: string[];
        isAdmin?: boolean;
    }

    let { modules, isAdmin = false }: TagAdminListProps = $props();

    let isReady: boolean = $state(false);
    let tags: Tag[] = $state([]);
    let showModal: boolean = $state(false);
    let values: Partial<Tag> = $state({});

    const dataFields: DataGridField[] = [
        { name: 'name', label: 'Tag', type: 'text', filterable: true },
        { name: 'module', label: 'Modules', type: 'text',  render: (name, row) => row.modules.join(', '), filterable: true },
        { name: 'visibile', label: 'Visible', type: 'checkbox', filterable: true },
    ];

    const addTag = () => {
        console.log('addTag');
        values = {};
        showModal = true;
    };

    const editTag = (row: DataGridRow) => {
        values = { ...row };
        values.modules = row.modules.filter( (module:string) => module !== 'system' );
        showModal = true;
    };

    const dataActions: DataGridAction[] = [
        { id: 'editTag', label: 'Edit', icon: Pencil, mode: 'warning', onclick: editTag },
    ];

    const dataButtons: DataGridButton[] = [
        { id: 'addTag', label: 'Add tag', mode: 'primary', onclick: addTag },
    ];

    const paginatorButtons: PaginatorButtons = {
		first: { mode: 'mode4', size: 'md', variant: 'outline' },
		prev: { mode: 'mode4', size: 'md', variant: 'outline' },
		next: { mode: 'mode4', size: 'md', variant: 'outline' },
		last: { mode: 'mode4', size: 'md', variant: 'outline' }
	};

    const handleSubmit = async ( values: Record<string, any> ) => {
        showModal = false;
        let res;
        if ( values.id ) {
            res = await storeTag.update(values as Tag);
        } else {
            res = await storeTag.add(values as Tag);
        }
        if ( res ) {
            tags = storeTag.list();
            return;
        }
        console.log(`Error ${values.id ? 'updating' : 'adding'} tag`);
    };

    onMount( async () => {
        if (storeTag.initiated) {
            tags = storeTag.list();
        } else {
            tags = isAdmin ? await storeTag.loadAll() || [] : await storeTag.load() || [];
        }
        isReady = true;
    });
</script>
{#if !isReady}
    <div>Loading...</div>
{:else}
    <DataGrid fields={dataFields} actions={dataActions} buttons={dataButtons} data={tags} {paginatorButtons}/>
{/if}
{#if showModal}
    <Modal title="Add tag" size='sm' oncancel={ () => showModal = false} onclose={() => showModal = false}>
        <TagForm {modules} tag={values} onsubmit={handleSubmit} />
    </Modal>
{/if}


