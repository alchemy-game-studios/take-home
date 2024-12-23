import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

export class PointRulesConfig {
  configFilePath = path.resolve('src/receipts/point-rules-config.yml');
  configFile = fs.readFileSync(this.configFilePath, 'utf8');
  config = yaml.load(this.configFile) as any;
}
