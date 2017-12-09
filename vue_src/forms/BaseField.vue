<doc>
A form field to be mixed in for FormlyFields.
</doc>

<script>
import { allProps } from 'utils/vue';

import Field from './Field';

export default {
    extends: Field,
    components: { Field },
    computed: { allProps },
};
</script>
