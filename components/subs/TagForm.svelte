<script lang="ts">
    import FormCreator from '$liwe3/components/FormCreator.svelte';

    import type { FormField } from '$liwe3/components/FormCreator.svelte';
    import type { Tag } from '$modules/tag/types';

    interface TagFormProps {
        tag?: Partial<Tag>;
        modules?: string[];

        onsubmit?: (tag: Record<string, any>) => void;
        onchange?: (name:string, value:any) => void;
    }

    let { tag, modules, onsubmit, onchange }: TagFormProps = $props();

    let fields: FormField[] = [
        { name: 'name', label: 'Tag', type: 'text', required: true },
    ];

    if (modules) {
        fields.push({ name: 'modules', label: 'Modules', type: 'select-multi', required: false, options: modules?.map( module => ({ label: module, value: module  })) });
    }

    fields.push({ name: 'visible', label: 'Visible', type: 'checkbox', required: false });

    const change = (name: string, value: any) => {
        onchange && onchange(name, value);
    };

    const submit = async ( values: Record<string, any> ) => {
        if( tag ) values = { ...tag, ...values };
        onsubmit && onsubmit(values);
    };
</script>
<FormCreator fields={fields} values={tag} onsubmit={submit} onchange={change} />
