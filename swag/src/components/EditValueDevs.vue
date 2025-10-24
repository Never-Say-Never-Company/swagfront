<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800">
    <v-card>
      <v-card-title class="headline d-flex justify-space-between align-center">
        Gerenciar Valor/Hora dos Desenvolvedores
        <v-btn icon flat @click="cancelEdit">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        
        <v-progress-linear
          v-if="loadingData || loadingSave || loadingUsers"
          indeterminate
          color="#D97F77"
          class="mb-3"
        ></v-progress-linear>
        
        <v-row dense class="mb-4" v-if="!loadingData && filteredAvailableUsers.length > 0">
          <v-col cols="12" sm="5">
            <v-select
              v-model="newItem.accountId"
              :items="filteredAvailableUsers"
              item-title="displayName"
              item-value="accountId"
              label="Nome do Desenvolvedor"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="newItem.valor_por_hora"
              label="Valor/Hora (R$)"
              variant="outlined"
              density="compact"
              hide-details
              type="number"
              prefix="R$"
              :rules="[v => !!v || 'Valor é obrigatório', v => v > 0 || 'O valor deve ser positivo']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3" class="d-flex align-center justify-end">
            <v-btn 
              color="#D97F77" 
              dark 
              @click="addItem" 
              :disabled="!newItem.accountId || !newItem.valor_por_hora || newItem.valor_por_hora <= 0"
            >
              Adicionar
            </v-btn>
          </v-col>
        </v-row>
         <v-row v-else-if="!loadingData && !loadingUsers">
             <v-col cols="12">
                <v-alert v-if="localItems.length > 0" type="info" text>
                    Todos os usuários disponíveis já foram adicionados à lista.
                </v-alert>
                <v-alert v-else type="info" text>
                    Nenhum usuário disponível para ser adicionado.
                </v-alert>
            </v-col>
        </v-row>
        <v-data-table
          :headers="headers"
          :items="localItems"
          item-value="id_desenvolvedor"
          density="comfortable"
          :hide-default-footer="true"
          class="elevation-1"
          v-if="!loadingData"
        >
          <template v-slot:item.valor_por_hora="{ item }">
            <div @click="startEdit(item.id_desenvolvedor)" style="cursor: pointer; min-height: 40px; display: flex; align-items: center;">
              
              <v-text-field
                v-if="editingItemId === item.id_desenvolvedor"
                v-model.number="item.valor_por_hora"
                type="number"
                variant="solo"
                density="compact"
                hide-details
                autofocus
                :prefix="editingItemId === item.id_desenvolvedor ? 'R$' : ''"
                @blur="stopEdit"
                @keyup.enter="stopEdit"
                :rules="[v => !!v || 'Valor é obrigatório', v => v > 0 || 'O valor deve ser positivo']"
                :style="{ 'min-width': '150px' }"
              ></v-text-field>

              <v-chip v-else color="grey-lighten-2">
                {{ formatCurrency(item.valor_por_hora) }}
              </v-chip>
            </div>
          </template>

          <template v-slot:item.actions="{ index }">
            <v-icon
              small
              @click="deleteItem(index)"
              color="red"
            >
              mdi-delete
            </v-icon>
          </template>

          <template v-slot:no-data>
            <v-alert type="info" text class="my-3">
                Nenhum desenvolvedor cadastrado.
            </v-alert>
          </template>
        </v-data-table>

      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="cancelEdit" :disabled="loadingSave">Cancelar</v-btn>
        <v-btn 
          color="#D97F77" 
          dark 
          @click="saveItems" 
          :loading="loadingSave"
          :disabled="!localItems.length || loadingSave || loadingData"
        >
          Salvar
        </v-btn>
      </v-card-actions>
      
      <v-alert
        v-if="status"
        :type="status.type"
        dense
        text
        class="mb-0"
      >
        {{ status.message }}
      </v-alert>

    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditValueDevs',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      localItems: [],
      availableUsers: [], // NOVA: Lista completa de usuários da API
      loadingUsers: false, // NOVO: Estado de carregamento dos usuários
      
      newItem: {
        accountId: null, // MUDANÇA: Agora armazena o accountId selecionado
        valor_por_hora: null,
      },
      status: null,
      editingItemId: null,
      loadingData: false,
      loadingSave: false,

      headers: [
        { title: 'Nome do Desenvolvedor', key: 'nome_desenvolvedor', sortable: false },
        { title: 'Valor/Hora (R$)', key: 'valor_por_hora', sortable: false }, 
        { title: 'Ações', key: 'actions', sortable: false, align: 'center', width: '10%' }
      ]
    };
  },
  computed: {
    // NOVO: Filtra a lista de usuários para mostrar apenas aqueles que NÃO estão em localItems
    filteredAvailableUsers() {
        const existingAccountIds = new Set(this.localItems.map(item => item.id_desenvolvedor));
        
        return this.availableUsers.filter(user => 
            !existingAccountIds.has(user.accountId)
        ).map(user => ({
            displayName: user.displayName,
            accountId: user.accountId
        }));
    }
  },
  watch: {
    modelValue(isOpen) {
      if (isOpen) {
        this.fetchData();
        this.fetchUsers(); // NOVO: Carregar usuários ao abrir
        this.status = null;
        this.editingItemId = null; 
        this.resetNewItem();
      }
    }
  },
  methods: {
    async fetchUsers() {
        this.loadingUsers = true;
        this.availableUsers = [];
        const endpoint = `${this.apiBaseUrl}/users/list_users`;
        
        try {
            const response = await axios.get(endpoint);
            // Mapeia o resultado para padronizar as chaves displayName e accountId
            this.availableUsers = response.data.map(user => ({
                displayName: user.displayName,
                accountId: user.accountId
            }));
        } catch (error) {
            console.error("Erro ao carregar lista de usuários:", error);
            this.status = { type: 'error', message: 'Falha ao carregar lista de usuários disponíveis.' };
        } finally {
            this.loadingUsers = false;
        }
    },
    
    async fetchData() {
      this.loadingData = true;
      this.status = null;
      this.localItems = [];
      
      const endpoint = `${this.apiBaseUrl}/developer-rates/list/`;
      
      try {
        const response = await axios.get(endpoint);
        const fetchedData = response.data;

        this.localItems = fetchedData.map(item => ({
             ...item,
             // Mapeia o accountId da API para o campo id_desenvolvedor no localItems
             id_desenvolvedor: item.id_desenvolvedor || item.accountId || Date.now() + Math.random(),
             // Adiciona o nome_desenvolvedor para exibição, se vier junto
             nome_desenvolvedor: item.nome_desenvolvedor || item.displayName || item.id_desenvolvedor
        }));

      } catch (error) {
        console.error("Erro ao carregar dados dos desenvolvedores:", error);
        this.status = { type: 'error', message: 'Falha ao carregar os dados. Verifique a conexão com a API e o endpoint.' };
      } finally {
        this.loadingData = false;
      }
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return '';
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    },
    resetNewItem() {
        this.newItem.accountId = null;
        this.newItem.valor_por_hora = null;
    },
    addItem() {
      if (this.newItem.accountId && typeof this.newItem.valor_por_hora === 'number' && this.newItem.valor_por_hora > 0) {
        
        // Encontra o nome de exibição do usuário selecionado
        const selectedUser = this.availableUsers.find(u => u.accountId === this.newItem.accountId);
        const displayName = selectedUser ? selectedUser.displayName : 'Usuário Desconhecido';
        
        this.localItems.push({
          // O id_desenvolvedor é o accountId
          id_desenvolvedor: this.newItem.accountId, 
          nome_desenvolvedor: displayName,
          valor_por_hora: parseFloat(this.newItem.valor_por_hora.toFixed(2)),
        });
        this.resetNewItem();
        this.status = { type: 'success', message: `Desenvolvedor ${displayName} adicionado.` };
        setTimeout(() => this.status = null, 1500);
      }
    },
    deleteItem(index) {
      this.localItems.splice(index, 1);
      this.status = { type: 'warning', message: 'Desenvolvedor removido da lista.' };
      setTimeout(() => this.status = null, 1500);
    },
    cancelEdit() {
      this.$emit('update:modelValue', false);
    },
    
    async saveItems() {
      this.stopEdit();
      
      const hasInvalidValue = this.localItems.some(item => !item.valor_por_hora || item.valor_por_hora <= 0);
      if (hasInvalidValue) {
        this.status = { type: 'error', message: 'Por favor, corrija os valores/hora inválidos ou zerados.' };
        return;
      }

      this.loadingSave = true;
      this.status = null;
      
      // Mapeia os dados para o formato que a API espera (accountId/id_desenvolvedor e valor_por_hora)
      const dataToSave = this.localItems.map(item => {
          return {
             id_desenvolvedor: item.id_desenvolvedor,
             valor_por_hora: item.valor_por_hora,
             nome_desenvolvedor: item.nome_desenvolvedor // Inclui o nome para o caso de a API precisar dele
          };
      });
      
      const endpoint = `${this.apiBaseUrl}/developer-rates/save/`; 
      
      try {
        await axios.post(endpoint, dataToSave, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        this.status = { type: 'success', message: 'Valores atualizados com sucesso!' };
        
        // Recarrega os dados e a lista de usuários para limpar o estado
        await Promise.all([this.fetchData(), this.fetchUsers()]);
        
        setTimeout(() => {
            this.$emit('update:modelValue', false);
        }, 800);
        
      } catch (error) {
        console.error("Erro ao salvar valores/hora dos desenvolvedores:", error);
        this.status = { type: 'error', message: `Falha ao salvar. Erro: ${error.response?.data?.detail || error.message}` };
      } finally {
        this.loadingSave = false;
      }
    },
    
    startEdit(itemId) {
      this.editingItemId = itemId;
    },
    stopEdit() {
      if (this.editingItemId !== null) {
        const item = this.localItems.find(i => i.id_desenvolvedor === this.editingItemId);
        if (item && item.valor_por_hora) {
          item.valor_por_hora = parseFloat(item.valor_por_hora.toFixed(2));
        }
        this.editingItemId = null;
      }
    }
  }
};
</script>

<style scoped>
</style>