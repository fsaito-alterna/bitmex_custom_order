# -ER_Proto_Block_Server

PrototypeのBlock APIサーバ。Dodaiをバックエンドとする。

Applet Storeサーバと共通の部分に関しては、

- 基本的にはBlockサーバ（このレポジトリ）に実装する
- Appletサーバ側はnpm dependencyとしてBlockサーバのコードを取り込んで利用する

[Applet Storeサーバはこちら](https://github.com/DaisukeMatsuoh/-ER_Proto_Store_Server)。

## Development

[swagger-node]を使って、プロジェクトの雛形生成及びswagger API specの編集を行っている。
（社内実績があるわけではないが、swagger公式のツールであり、ワークフローもまともそうであるため）

[swagger-node]: https://github.com/swagger-api/swagger-node

### 開発環境構築

1. このレポジトリをローカルに`git clone`する
2. `cd -ER_Proto_Block_Server`
2. 開発用Node.jsのバージョン管理は[asdf]で行う。こちらは社内実績あり
    - リンク先のとおりにasdfをインストール
    - `asdf plugin-add nodejs`を実行
        - [asdf-nodejs]の説明のとおりにgpg公開鍵を導入
    - `asdf install`を実行
3. `npm install`を実行
4. あとは実行したい内容により、
    - swaggerのAPI仕様を編集したいなら、`npm run swagger:edit`を実行
        - ローカルにWebエディタが立ち上がるので、ブラウザで編集する。
          このエディタはswagger公式のOSSで、swaggerファイルを検証してくれる。社内実績あり
        - 自分のエディタで`api/swagger/swagger.yaml`を編集してから、ブラウザ上で検証にかけても良い
    - サーバをローカルに起動したいなら、`npm start`を実行
    - その他の用途やデプロイについては追って調査・策定
5. `eslint`を使っているので、以下のいずれかの方法で適用し、修正済みのコードをcommitする
    - エディタの拡張機能等を利用して、編集時や保存時に逐一適用していく（推奨）
    - ローカルインストールされる`eslint`を`npx eslint --fix .`で実行する
    - 手元環境に`eslint`をグローバルインストールしているならば`eslint --fix .`でも良い

[asdf]: https://github.com/asdf-vm/asdf
[asdf-nodejs]: https://github.com/asdf-vm/asdf-nodejs

### ワークフロー

ほぼ[swagger-node]公式の通り

1. 前節の通り、`npm run swagger:edit`でAPI仕様を編集する
2. Branchにcommitし、PRし、レビューを受けてmergeする
3. 仕様が固まった部分から、`api/controllers/`以下でcontrollerを実装していく
4. Branchにcommitし、PRし、レビューを受けてmergeする
5. その他の作業やデプロイについては追って調査・策定

## Test

- `npm test`で実行する
    - ファイル変更を監視したい場合は`npm run test:watch`で実行
- `npm run swagger:edit`でswagger-editorを起動している際に、UI上からAPIをTryする場合は、
  別のターミナルから`npm run mock`でモックサーバを起動しておくと、
  ダミーレスポンスを得つつ認証機能だけ確認するなどが可能
    - RequestのJSONスキーマによるvalidationを試すことができる
    - 一部の一般的な`format`のダミー値生成に対応していないため、Response Validation Failedとなることもある

## Secrets

秘密情報は、`swagger-node`に付属の[`node-config`](https://www.npmjs.com/package/config)の機能に則って管理する。
プロトタイプ向けに使用するDodai Appに関する値は[#559]を参照。

[#559]: https://my.redmine.jp/citizen/issues/559

`config/*.yaml`ファイルに必要な情報を挿入する。Gitにテンプレートを含めてあるので、それに則って値を埋める。
アプリケーションが実行される際の`NODE_ENV`環境変数と同じファイル名の設定が読み込まれる。

- テスト時: `config/test.yaml`
    - Gitに含めて管理する。ダミーの値のみ含む
    - `npm test`時には自動的に`NODE_ENV=test`となる
- ローカル開発時: `config/development.yaml`
    - `NODE_ENV`を指定せずに`npm start`等でサーバを起動した場合。`npm run mock`でモックサーバを起動する場合も同様
    - Dodaiを利用したいケースもあるため、gitignoreして開発者の手元で手動で値を埋めて利用する
    - **`encryption_key`は`LocalEncryptionKey`とする**
    - [`node-config`のdoc](https://github.com/lorenwest/node-config/wiki/Strict-Mode)にあるが、
      `local.yaml`は紛らわしいので使用しない
- デプロイ時: `config/production.yaml`
    - Prototypeの間はstaging/production構成をとらないため、productionのみとする
    - gitignoreしてデプロイ前にファイル存在確認する。具体的な作業手順はまだ決めていないが、以下のような想定
        - CIする場合はデプロイジョブの環境変数等から注入する
        - 手動デプロイなら作業者の環境変数等から注入する

AppKey相当の権限で実行するAPIは、Dodaiが発行するAppKeyを一段階暗号化した暗号化済みAppKeyを必要とする。
この値はクライアント（WebUI及びスマホアプリ）に埋め込んで良い。`npm run generate_encrypted_app_key:(dev|prod)`で生成する。
対象とする環境向けの`config/*.yaml`をセットした上で実行すること。つまり:

- ローカル開発用: `config/development.yaml`をセットして、`npm run generate_encrypted_app_key:dev`
- クラウドデプロイ用: `config/production.yaml`をセットして、`npm run generate_encrypted_app_key:prod`
- （WebUI向けには、開発サーバ起動時orクラウドデプロイ時に自動で埋め込みが行われるよう設定できる想定）

## Dodai Appの準備

- [#559]の記録を参照。
- Collectionの作成は`npm run dodai:create_collections`を実行する。
    - ダミーデータの注入等が必要であればほかにも同様にnpm-scriptを用意する。

## Deploy

- [Ansible]を利用する。
- Nginxをwebサーバとし、静的ファイルの配信と、nodeプロセスへのリクエスト転送を行う。
- Nodeプロセスの監視は[pm2]を用いる。
- Nodeプロセスは`erapps`ユーザで[pm2]を用いて起動する。
  その他のデプロイ時の操作や静的アセットのビルド等は`erdeploy`ユーザで行う。
    - `erdeploy`ユーザはsudo権限を持つため、基本的には`erdeploy`ユーザが起点となって全ての操作を行う。
- プロトタイプでは以下は行わない:
    - ELB/ALBの利用
    - スケールアウト
    - 独自ドメイン
    - HTTPS化
    - アセットのCDN配信

[Ansible]: https://www.ansible.com/
[pm2]: http://pm2.keymetrics.io/

### 手動実行

- [Ansible]を手元のPCにインストールする(2.4以上を推奨)
- クラウド用の設定ファイルを用意する(`config/production.yaml`)
- デプロイ用マシンユーザの秘密鍵を用意する(`~/.ssh/id_rsa_erdeploy.pem`)
- リモートサーバ上で`git clone/pull`する際に、ローカルにあるデプロイ用マシンユーザの秘密鍵を`ssh-agent`経由で利用するため、
  `eval "$(ssh-agent)"`で`ssh-agent`を起動させておく(bash系の場合)
    - その他の方法で`ssh-agent`を起動させている場合はこのステップは不要
 - `ssh-add ~/.ssh/id_rsa_erdeploy.pem`して秘密鍵をForwardingするよう登録
    - これも同様に、自動で登録されるような設定を行っている場合は不要
- `ansible-playbook deploy/deploy.yaml`

### デバッグ、ログチェック

- ソースコードやweb rootはインスタンス上の`/app`ディレクトリ以下に配置される。
  問題が発生した場合は`erdeploy`ユーザでインスタンスにログインして`/app`以下で調査する。
- 全体としてのアクセスログはnginxのアクセスログとなる。sudo可能なユーザで、`/var/log/nginx/(access|error).log`を開く。
- Nodeプロセスのログは、[pm2]のログ機能で見ることができる。`erapps`ユーザで`pm2 log`コマンドで開く。詳細な使い方は[pm2]のヘルプを参照。
