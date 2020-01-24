const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('JHipster generator ansible', () => {
    describe('Test with SQL monolith', () => {
        beforeEach(done => {
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/maven-sql'), dir);
                })
                .withOptions({
                    testmode: true
                })
                .withPrompts({
                    ansibleWorkspacePath: './ansible',
                    mavenSnapshotsUrl: 'http://snapshots.local',
                    mavenReleasesUrl: 'http://releases.local',
                    environments: 'test,prod',
                    sshUser: 'jhipster'
                })
                .on('end', done);
        });

        it('creates ansible base files', () => {
            assert.file([
                'ansible/ansible.cfg',
                'ansible/.gitignore',
                'ansible/sample-ansible-playbook.yml',
                'ansible/hosts/shared-vars.yml',
                'ansible/hosts/shared-secrets.yml',
                'ansible/README.md',
                'ansible/requirements.yml',
                'ansible/templates/sample-ansible/logback-spring.xml.j2',
                'ansible/templates/sample-ansible/application-prod.yml.j2'
            ]);
        });
        it('creates test and prod environment files', () => {
            assert.file([
                'ansible/hosts/test/inventory',
                'ansible/hosts/test/group_vars/sample-ansible/vars.yml',
                'ansible/hosts/test/group_vars/sample-ansible/vault.yml',

                'ansible/hosts/prod/inventory',
                'ansible/hosts/prod/group_vars/sample-ansible/vars.yml',
                'ansible/hosts/prod/group_vars/sample-ansible/vault.yml'
            ]);
        });
        it('inserts ssh user in ansible.cfg files', () => {
            assert.fileContent('ansible/ansible.cfg', 'remote_user = jhipster');
        });
        it('uses ansible variables in application-prod.yml.j2 template', () => {
            assert.fileContent('ansible/templates/sample-ansible/application-prod.yml.j2', '{{sample_ansible.spring_datasource_url}}');
            assert.fileContent('ansible/templates/sample-ansible/application-prod.yml.j2', '{{sample_ansible.spring_datasource_username}}');
            assert.fileContent('ansible/templates/sample-ansible/application-prod.yml.j2', '{{sample_ansible.spring_datasource_password}}');
            assert.fileContent(
                'ansible/templates/sample-ansible/application-prod.yml.j2',
                '{{sample_ansible.jhipster_security_authentication_jwt_base64_secret}}'
            );
        });
        it('sets the ansible group name in hosts file and playbook', () => {
            assert.fileContent('ansible/hosts/prod/inventory', '[sample-ansible]');
            assert.fileContent('ansible/sample-ansible-playbook.yml', 'hosts: sample-ansible');
        });
        it('sets the shared vars and secrets in the playbook', () => {
            assert.fileContent('ansible/sample-ansible-playbook.yml', 'hosts/shared-vars.yml');
            assert.fileContent('ansible/sample-ansible-playbook.yml', 'hosts/shared-secrets.yml');
        });
        it('populates vars.yml file from the current application-prod.yml file', () => {
            assert.fileContent('ansible/hosts/prod/group_vars/sample-ansible/vars.yml', 'sample_ansible:');
            assert.fileContent('ansible/hosts/prod/group_vars/sample-ansible/vars.yml', 'spring_datasource_url: jdbc:mysql://');
            assert.fileContent('ansible/hosts/prod/group_vars/sample-ansible/vars.yml', 'spring_datasource_username: root');
            assert.fileContent(
                'ansible/hosts/prod/group_vars/sample-ansible/vars.yml',
                'password: "{{sample_ansible.vault_spring_datasource_password}}"'
            );
            assert.fileContent(
                'ansible/hosts/prod/group_vars/sample-ansible/vars.yml',
                'base64_secret: "{{sample_ansible.vault_jhipster_security_authentication_jwt_base64_secret}}"'
            );
        });
        it('populates vault.yml file from the current application-prod.yml file', () => {
            assert.fileContent('ansible/hosts/prod/group_vars/sample-ansible/vars.yml', 'sample_ansible:');
            assert.fileContent('ansible/hosts/prod/group_vars/sample-ansible/vault.yml', 'vault_spring_datasource_password: rootpassword');
            assert.fileContent(
                'ansible/hosts/prod/group_vars/sample-ansible/vault.yml',
                'vault_jhipster_security_authentication_jwt_base64_secret: my-base-64-secret'
            );
        });
    });
});
